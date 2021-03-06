angular.module("Lms")
    .service('LessonService', function (CourseService, $q, $http, serverRef, Tools, $mdDialog) {
        var scope = this;
        scope.createLesson = function (lesson, id) {
            var deferred = $q.defer();
            lesson.courseID = id;
            console.log(lesson, id);
            Tools.loader();
            var loginData = JSON.parse(localStorage.getItem('loginData'));
            lesson.creatorID = loginData._id;
            lesson.courseID = id;
            $http.post(serverRef + '/lessons/createLesson', lesson).then(
                function (success) {
                    $mdDialog.hide();
                    if (success.data.code) {
                        deferred.resolve(success.data.lesson);
                        Tools.showMsg('إنشاء الدرس بنجاح');
                    }
                    else {
                        Tools.showMsg('فشل'); 
                    }
                },
                function (error) {
                    $mdDialog.hide();
                    Tools.showMsg('فشل')
                }
            );
            return deferred.promise;
        };
        scope.pushVideo = function (video) {
            console.log(video);
            Tools.loader();
            var loginData = JSON.parse(localStorage.getItem('loginData'));
            var selectedLesson = localStorage.getItem('selectedLesson');
            $http.post(serverRef + '/lessons/pushVideo', {video: video, lessonID: selectedLesson}).then(
                function (success) {
                    $mdDialog.hide();
                    console.log(success);
                    success.data.code ? Tools.showMsg('') : Tools.showMsg('');
                },
                function (error) {
                    $mdDialog.hide();
                    console.log(error);
                    Tools.showMsg('فشل')
                }
            )
        };
    });