angular.module("Lms")
    .service('CourseService', function ($q, $http, serverRef, Tools, $mdDialog) {
        this.createCourse = function (course) {
            Tools.loader();
            var loginData = JSON.parse(localStorage.getItem('loginData'));
            course.creatorID = loginData._id;
            $http.post(serverRef + '/courses/create_course', course).then(
                function (success) {
                    $mdDialog.hide();
                    success.data.code ? Tools.showMsg('بالطبع خلق بنجاح') : Tools.showMsg('فشل');
                },
                function (error) {
                    $mdDialog.hide();
                    Tools.showMsg('فشل')
                }
            )
        };
        this.getAllCourses = function () {
            var deferred = $q.defer();
            $http.get(serverRef + '/courses/allCourses').then(
                function (success) {
                    deferred.resolve(success.data);
                }
            );
            return deferred.promise;
        };
        this.joinCourse = function (courseID, userID) {
            Tools.loader();
            $http.post(serverRef + '/courses/joinCourse', {courseID: courseID, userID: userID}).then(
                function (success) {
                    $mdDialog.hide();
                    success.data.code ? Tools.showMsg('انضم الدورة بنجاح') : Tools.showMsg('فشل انضم');
                    console.log(success)
                },
                function (success) {
                    console.log(success);
                    $mdDialog.hide();
                    Tools.showMsg('فشل انضم');
                }
            )
        };
        this.fetchMyCourses = function () {
            var deferred = $q.defer();
            $http.get(serverRef + '/courses/myCourses').then(
                function (success) {
                    console.log(success);
                    deferred.resolve(success.data);
                },
                function (err) {
                    console.log(err)
                }
            );
            return deferred.promise;
        }
    });