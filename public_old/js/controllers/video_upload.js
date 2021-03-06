angular.module("Lms")
    .controller('VideoUploadCtrl', function (Tools,$scope, LessonService, $mdSidenav) {
        var STATUS_POLLING_INTERVAL_MILLIS = 60 * 1000; // One minute.
        $scope.postUpload = function () {
            $scope.onProgressData = {};
            $scope.uploadedVideoData = {};
            // location.reload();
            $mdSidenav('upload-video-sidenav').toggle();
        };
        signinCallback = function (result) {
            if (result.access_token) {
                var uploadVideo = new UploadVideo();
                uploadVideo.ready(result.access_token);
            }
        };
        var UploadVideo = function () {
            /**
             * The array of tags for the new YouTube video.
             *
             * @attribute tags
             * @type Array.<string>
             * @default ['google-cors-upload']
             */
            this.tags = ['youtube-cors-upload'];

            /**
             * The numeric YouTube
             * [category id](https://developers.google.com/apis-explorer/#p/youtube/v3/youtube.videoCategories.list?part=snippet&regionCode=us).
             *
             * @attribute categoryId
             * @type number
             * @default 22
             */
            this.categoryId = 22;

            /**
             * The id of the new video.
             *
             * @attribute videoId
             * @type string
             * @default ''
             */
            this.videoId = '';

            this.uploadStartTime = 0;
        };
        UploadVideo.prototype.ready = function (accessToken) {
            this.accessToken = accessToken;
            this.gapi = gapi;
            this.authenticated = true;
            this.gapi.client.request({
                path: '/youtube/v3/channels',
                params: {
                    part: 'snippet',
                    mine: true
                },
                callback: function (response) {
                    if (response.error) {
                        console.log(response.error.message);
                    } else {
                        // console.log(response.items[0].snippet);
                        $scope.channel = response.items[0].snippet;
                        console.log($scope.channel);
                        $scope.$apply();
                        // $('#channel-name').text(response.items[0].snippet.title);
                        // $('#channel-thumbnail').attr('src', response.items[0].snippet.thumbnails.default.url);
                        // $('.pre-sign-in').hide();
                        // $('.post-sign-in').show();
                    }
                }.bind(this)
            });
            document.getElementById('video-uploader-button').addEventListener("click", this.handleUploadClicked.bind(this));
            // $('#button').on("click", this.handleUploadClicked.bind(this));
        };
        UploadVideo.prototype.uploadFile = function (file) {
            $scope.video.categoryId = 22;
            $scope.video.tags = ['youtube-cors-upload'];
            var metadata = {
                snippet: $scope.video,
                status: {
                    privacyStatus: 'public'
                    // privacyStatus: $('#privacy-status option:selected').text()
                }
            };
            var uploader = new MediaUploader({
                baseUrl: 'https://www.googleapis.com/upload/youtube/v3/videos',
                file: file,
                token: this.accessToken,
                metadata: metadata,
                params: {
                    part: Object.keys(metadata).join(',')
                },
                onError: function (error) {
                    console.log(JSON.parse(error));
                    Tools.showMsg('فشل لتحميل يرجى إنشاء شانيل على يوتيوب')
                }.bind(this),
                onProgress: function (data) {
                    var bytesPerSecond = data.loaded / ((Date.now() - this.uploadStartTime) / 1000);
                    $scope.onProgressData = data;
                    $scope.onProgressData.estimatedSecondsRemaining = (data.total - data.loaded) / bytesPerSecond;
                    $scope.onProgressData.bytesPerSecond = bytesPerSecond;
                    $scope.onProgressData.percentage = (data.loaded * 100) / data.total;
                    $scope.$apply();
                    /*$('#upload-progress').attr({
                     value: data.loaded,
                     max: data.total
                     });*/
                }.bind(this),
                onComplete: function (data) {
                    var uploadResponse = JSON.parse(data);
                    $scope.uploadedVideoData = {
                        title: uploadResponse.snippet.localized.title,
                        videoID: uploadResponse.id,
                        thumbnails: uploadResponse.snippet.thumbnails,
                        description: uploadResponse.snippet.localized.description
                    };
                    LessonService.pushVideo($scope.uploadedVideoData);
                    $scope.$apply();
                    this.videoId = uploadResponse.id;
                    this.pollForVideoStatus();
                }.bind(this)
            });
            this.uploadStartTime = Date.now();
            uploader.upload();
        };
        UploadVideo.prototype.handleUploadClicked = function () {
            var file = document.getElementById('file').files[0];
            this.uploadFile(file);
        };
        UploadVideo.prototype.pollForVideoStatus = function () {
            this.gapi.client.request({
                path: '/youtube/v3/videos',
                params: {
                    part: 'status,player',
                    id: this.videoId
                },
                callback: function (response) {
                    if (response.error) {
                        // The status polling failed.
                        console.log(response.error.message);
                        setTimeout(this.pollForVideoStatus.bind(this), STATUS_POLLING_INTERVAL_MILLIS);
                    } else {
                        var uploadStatus = response.items[0].status.uploadStatus;
                        console.log(uploadStatus);
                        switch (uploadStatus) {
                            case 'uploaded':
                                setTimeout(this.pollForVideoStatus.bind(this), STATUS_POLLING_INTERVAL_MILLIS);
                                break;
                            case 'processed':
                                break;
                            default:
                                break;
                        }
                    }
                }.bind(this)
            });
        };
    });