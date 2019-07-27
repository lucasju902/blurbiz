var pg = require('pg');
var config = require('./config.js');
var jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');
var uuidGen = require('node-uuid');
var ss = require('socket.io-stream');
var path = require('path');
var fs = require('fs');
var s3 = require('s3');
var download = require('url-download');
var readChunk = require('read-chunk');
var fileType = require('file-type');
var googleDrive = require('google-drive');
var gm = require('gm');
var ffmpeg = require('fluent-ffmpeg');
var async = require('async');

var transporter = nodemailer.createTransport({
    'service': 'gmail',
    'auth': config.mailConfig.auth
});

function sendEmail(options, cb) {
    console.log('send email: ' + JSON.stringify(options));
    transporter.sendMail(options, function(error, info) {
                if (error) {
                        console.log(error);
                        successFalseCb(error, cb);
                        return;
                }
                console.log('Message sent: ' + info.response);
                successCb(cb);
        });
}

function sendConfirmationEmail(email, link, cb) {
    if (cb == null) {
        throw new Error('no callback in sendConfirmationEmail method');
    }
    console.log('call sendConfirmationEmail method: email = ' + email);

    var template = config.mailConfig.template_signup_confirmation;
    var from = template.from;
    var to = email;
    var subject = template.subject;
    var html = template.html;
    html = html.replace('link_placeholder', link);
    
    var options = {
            'from': from,
            'to': to,
            'subject': subject,
            'html': html
    }

    sendEmail(options, cb);
}

function sendResetPasswordEmail(email, link, cb) {
    if (cb == null) {
                throw new Error('no callback in sendResetPasswordEmail method');
        }
        console.log('call sendResetPasswordEmail method: email = ' + email);

    var template = config.mailConfig.template_reset_password;
        var from = template.from;
        var to = email;
        var subject = template.subject;
        var html = template.html;
        html = html.replace('link_placeholder', link);

        var options = {
                'from': from,
                'to': to,
                'subject': subject,
                'html': html
        }

    sendEmail(options, cb);
}

function updateFields(tableName, tableIdValue, namesAndValuesArray, callback) {
     try {
                console.log('call method updateFields: tableName = ' + tableName + ', tableIdValue = ' + tableIdValue + ', namesAndValues = ' + JSON.stringify(namesAndValuesArray));
        var names = [];
        var values = [];
        namesAndValuesArray.forEach(function (nameAndValue) {
            names.push(nameAndValue.name);
            values.push("'" + nameAndValue.value  + "'");
        });
        var queryText = 'UPDATE public."' + tableName + '" SET (' + names.join(', ') + ') = (' + values.join(', ') + ') WHERE id = ' + tableIdValue + ';';
        console.log(queryText);
                query(queryText, [], function(err, result) {
                        if (err) {
                                successFalseCb(err, callback);
                        } else {
                                successCb(callback);
                        }
                });

        } catch (err) {
                console.log('error in method createEmailConfirmationEntry: ' + err);
                successFalseCb(err, callback);
        }

}

function updateProjectFields(projectId, namesAndValuesArray, cb) {
    updateFields('project', projectId, namesAndValuesArray, cb);
}

function updateUserFields(userId, namesAndValuesArray, cb) {
        updateFields('user', userId, namesAndValuesArray, cb);
}

//TODO use connection pool
function query_pool(text, values, cb) {
      pg.connect(function(err, client, done) {
        client.query(text, values, function(err, result) {
          done();
          cb(err, result);
        })
      });
}

function query(text, values, cb) {
    var client = new pg.Client(config.dbConfig);

    // connect to our database
    client.connect(function (err) {
        if (err) throw err;

        // execute a query on our database
        client.query(text, values, function (err, result) {
            if (err) throw err;

            // disconnect the client
            client.end(function (err) {
                if (err) throw err;
            });
            
            cb(err, result);
        });
    });
}

function successFalseCb(msg, callback, additionalParams) {
    var result = {
            'success': false,
                'msg': '' + msg
        };
    if (additionalParams) {
                result = mergeJson(result, additionalParams);
        }
        if (callback != null) {
            callback(null, result);
        }
}

function mergeJson(obj1, obj2) {
    var result={};
    for(var key in obj1) result[key]=obj1[key];
    for(var key in obj2) result[key]=obj2[key];
    return result;
}

function successCb(callback, additionalParams, separateParams) {
    var result = {
        'success': true
    }
    if (additionalParams) { 
        result = mergeJson(result, additionalParams);
    }
        if (callback != null) {
        if (separateParams) {
            callback(null, result, separateParams);
        } else {
                    callback(null, result);
        }
        }
}

function createEmailConfirmationEntry(userId, code, callback) {
    try {
        console.log('call method createEmailConfirmationEntry: userId = ' + userId + ', code = ' + code);
        query('INSERT INTO public.email_confirmation(user_id, code)' +
                    ' VALUES ($1, $2) RETURNING id;', [userId, code], function(err, result) {
                        if (err) {
                            successFalseCb(err, callback);
                        } else {
                            successCb(callback);
            }
                });
    } catch (err) {
        console.log('error in method createEmailConfirmationEntry: ' + err);
                successFalseCb(err, callback);
    }
}


function createResetPasswordEntry(userId, code, callback) {
        try {
                console.log('call method createResetPasswordEntry: userId = ' + userId + ', code = ' + code);
                query('INSERT INTO public.reset_password(user_id, code)' +
                        ' VALUES ($1, $2) RETURNING id;', [userId, code], function(err, result) {
                        if (err) {
                                successFalseCb(err, callback);
                        } else {
                                successCb(callback);
                        }
                });
        } catch (err) {
                console.log('error in method createResetPasswordEntry: ' + err);
                successFalseCb(err, callback);
        }
}


function createUser(email, password, name, callback) {
    try {
        console.log('call method createUser: email = ' + email + ', name = ' + name);
        isEmailExists(email, function(err, result) {
            if (err) {
                successFalseCb(err, callback);
                return;
            }
            var isEmailEx = result;
            if (isEmailEx) {
                successFalseCb('Email ' + email + '  already exists', callback);
                return;
            }
            query('INSERT INTO public.user(email, password, name)' +
                        ' VALUES ($1, $2, $3) RETURNING id;', [email, password, name], function(err, result) {
                if (err) {
                    successFalseCb(err, callback);
                } else {
                                        var row = result.rows[0];
                                        var userId = row.id;
                                        successCb(callback, {
                                                'user_id': userId
                                        });
                }
            });

        });
    } catch (err) {
        console.log('error in method createUser: ' + err);
        successFalseCb(err, callback);
    }
}

function createProject(userId, projectName, callback) {
        try {
        console.log('call method createProject: userId = ' + userId + ', projectName = ' + projectName);
                isProjectExists(userId, projectName, function(err, result) {
                        if (err) {
                                successFalseCb(err, callback);
                                return;
                        }
                        var isProjectEx = result;
                        if (isProjectEx) {
                                successFalseCb('Project ' + projectName + ' already exists', callback);
                                return;
                        }
                        query('INSERT INTO public.project(user_id, project_name)' +
                                ' VALUES ($1, $2) RETURNING id;', [userId, projectName], function(err, result) {
                                if (err) {
                                        successFalseCb(err, callback);
                                } else {
                    var row = result.rows[0];
                    var newProjectId = row.id;
                    successCb(callback, {
                        'new_project_id': newProjectId
                    });
                                }
                        });

                });
        } catch (err) {
                console.log('error in method createProject: ' + err);
                successFalseCb(err, callback);
        }
}

function deleteProject(projectId, callback) {
        try {
                debugger;
                console.log('call method deleteProject: projectId = ' + projectId);
                query('SELECT path FROM public.media_file WHERE project_id = $1;', [projectId], function(err, result) {
                    if (!err) {
                        // for (var i = 0; i < result.rows.length; i++) {
                        //     var row = result.rows[i];
                        //     deleteImage(row.file_path, null);
                        // }

                        debugger;

                        var asyncTasks = [];
                        result.rows.forEach(function(row) {
                            asyncTasks.push(function(parallel_callback) {
                                deleteImage(row.path, parallel_callback);
                            });
                        });

                        async.parallel(asyncTasks, function() {
                            query('DELETE FROM public.project WHERE id = $1;', [projectId], function(err, result) {
                                if (err) {
                                        successFalseCb(err, callback);
                                } else {
                                        successCb(callback);
                                }
                            });
                        });
                    }
                });
                
                
        } catch (err) {
                console.log('error in method deleteProject: ' + err);
                successFalseCb(err, callback);
        }
}

function deleteImage(file_path, callback) {
        try {
            var client = s3.createClient({
                    s3Options: {
                        accessKeyId: config.s3_config.ACCESS_KEY,
                        secretAccessKey: config.s3_config.SECRECT_KEY,
                        region: 'us-west-2'
                    }
            });

            var deleteParam = {
                Bucket: config.s3_config.BUCKET_NAME,
                Delete: {
                    Objects: [
                        {
                            Key: path.basename(file_path)
                        }
                    ]
                }
            };

            var deleter = client.deleteObjects(deleteParam);

            deleter.on('error', function(err) {
                console.error("unable to delete:", err.stack);
                successFalseCb(err, callback);
            });

            deleter.on('progress', function() {
                console.log("progress", deleter.progressAmount, deleter.progressTotal);
            });

            deleter.on('end', function() {
                console.log("File Deleted", file_path);                
                query('DELETE FROM public.media_file WHERE path = $1;', [file_path], function(err, result) {
                    if (err) {
                            successFalseCb(err, callback);
                    } else {
                            successCb(callback);
                    }
                });                 
            });
            
        } catch (err) {
            console.log('error in method deleteImage: ' + err);
            successFalseCb(err, callback);
        }
}

function deleteEmailConfirmationEntry(userId, callback) {
        try {
                console.log('call method deleteEmailConfirmationEntry: userId = ' + userId);
                query('DELETE FROM public.email_confirmation WHERE user_id = $1;', [userId], function(err, result) {
                        if (err) {
                                successFalseCb(err, callback);
                        } else {
                                successCb(callback);

                        }
                });
        } catch (err) {
                console.log('error in method deleteEmailConfirmationEntry: ' + err);
                successFalseCb(err, callback);
        }
}

function deleteResetPasswordEntry(userId, callback) {
        try {
                console.log('call method deleteResetPasswordEntry: userId = ' + userId);
                query('DELETE FROM public.reset_password WHERE user_id = $1;', [userId], function(err, result) {
                        if (err) {
                                successFalseCb(err, callback);
                        } else {
                                successCb(callback);

                        }
                });
        } catch (err) {
                console.log('error in method deleteResetPasswordEntry: ' + err);
                successFalseCb(err, callback);
        }
}

function confirmateEmail(userId, code, callback) {
        try {
                console.log('call method confirmateEmail: userId = ' + userId + ', code = ' + code);
                query('SELECT count(*) FROM public.email_confirmation WHERE user_id = $1 and code = $2;', [userId, code], function(err, result) {
                        if (err) {
                                successFalseCb(err, callback);
                        } else {
                var count = result.rows[0].count;
                if (count == 0) {
                    successFalseCb('code ' + code + ' is not found for user ' + userId, callback);
                } else {
                    updateFields('user', userId, [
                            {
                            'name': 'is_confirmed', 
                            'value': true
                        }
                    ], function(err1, result1) {
                        if (err1) {
                            successFalseCb(err1, callback);
                            return;
                        }
                        deleteEmailConfirmationEntry(userId, function(err2, result2) {
                                            if (err2) {
                                                            successFalseCb(err2, callback);
                                                            return;
                                                    }
                                            successCb(callback);
                        });
                    });
                }
                        }
                });
        } catch (err) {
                console.log('error in method confirmateEmail: ' + err);
                successFalseCb(err, callback);
        }
}



function projectList(userId, callback) {
        try {
            
                console.log('call method projectList: userId = ' + userId);      
                
                query('SELECT DISTINCT ON(t.id) t.*, media_file.path  FROM (    SELECT project.id AS id, project.project_name, COUNT(media_file.path) as screen_count, project.created_at          FROM public.project AS project          LEFT JOIN public.media_file AS media_file       ON project.id = media_file.project_id       WHERE project.user_id= $1       GROUP By project.id) AS t  LEFT JOIN public.media_file AS media_file    ON media_file.project_id = t.id   AND media_file.order_in_project =     (SELECT MIN(order_in_project) FROM media_file WHERE media_file.project_id = t.id) ORDER BY t.id, media_file.id ASC;', [userId], function(err, result) {
                        if (err) {
                            successFalseCb(err, callback);
                        } else {
                var projects = [];
                for (var i = 0; i < result.rows.length; i++) {
                                var row = result.rows[i];
                    var project = {
                        'project_id': row.id,
                        'project_name': row.project_name,
                        'screen_count': row.screen_count,
                        'representative': row.path,
                        'resolution': row.resolution,
                        'created_at': row.created_at
                    };
                                    projects.push(project);
                }
                                successCb(callback, {
                                    'projects': projects
                                });
                        }
                });
        } catch (err) {
                console.log('error in method projectList: ' + err);
                successFalseCb(err, callback);
        }
}


function getToken(user) {
    return jwt.sign(user, config.tokenKey);
}

function checkToken(token, callback) {
        jwt.verify(token, config.tokenKey, callback);
}

function checkAuth(email, password, callback) {
    console.log('call method checkAuth');
    try {
        isEmailExists(email, function(err, result) {
            if (err) {
                successFalseCb(err, callback);
                return;
                        }
            var isEmailEx = result;
                        if (!isEmailEx) {
                successFalseCb('Email ' + email + ' doesn\'t registered', callback);
                                return;
                        } else {
                getUserInfo(email, function(err, user) {
                    if (err) {
                        successFalseCb(err, callback);
                                        return;
                                }
                    //console.log(JSON.stringify(user));
                    if (user.password == password) {
                        var msg = null;
                        if (user.is_confirmed == false) {
                            msg = 'waiting for email confirmation';
                        }  
                        successCb(callback, {
                                                    'is_confirmed': user.is_confirmed,
                                                        'msg': msg,
                            'token': getToken(user)
                                                });
                    } else {
                        successFalseCb('incorrect password for user ' + email, callback);
                    }
                });
            }
        });
    } catch (err) {
        console.log('error in method checkAuth: ' + err);
        successFalseCb(err, callback);
    }
}

function getUserInfo(email, callback) {
    console.log('call method getUserInfo: email = ' + email);
    try {
        query('SELECT * from public.user where email = $1', [email], function(err, result) {
                        if (err) {
                successFalseCb(err, callback);
                                return;
                        }
            var user = result.rows[0];
            //console.log(JSON.stringify(user));
            if (callback != null) {
                            callback(null, user);
                }
        });
    } catch (err) {
        console.log('error in method getUserInfo: ' + err);
        successFalseCb(err, callback);
    }
}

function scheduleTask(projectId, scheduledStartDate, targetNetwork, title, description, callback) {
    try {
                console.log('call method scheduleTask: projectId = ' + projectId + ', scheduledStartDate: ' + scheduledStartDate + ', targetNetwork: ' + targetNetwork + ', title: ' + title + ', description: ' + description);
                query('INSERT INTO public.task (project_id, scheduled_start_date, target_social_network, title, description) VALUES ($1, $2, $3, $4, $5) RETURNING id;', [projectId, scheduledStartDate, targetNetwork, title, description], function(err, result) {
                        if (err) {
                                successFalseCb(err, callback);
                        } else {
                                var row = result.rows[0];
                                if (row != null) {
                                        successCb(callback, {
                                                'task_id': row.id
                                        });
                                } else {
                                        successFalseCb('result row is null for the query', callback);
                                }
                        }
                });
        } catch (err) {
                console.log('error in method scheduleTask: ' + err);
                successFalseCb(err, callback);
        }
}

function saveGoogleFile(message, callback) {

        googleDrive(message.accessToken).files(message.fileId).get(function(err, response, body) {
            if (err) return console.log('err', err);
            if (response.statusCode != 200) return console.log('Error happened', response.statusCode);
            console.log('response', response);
            console.log('body', JSON.parse(body));

            saveMediaFile(message.project_id, JSON.parse(body).thumbnailLink.split("=s")[0], callback);
        });
}

function putMediaToS3bucketAndSaveToDB(project_id, filename, callback) {
    
    var buffer = readChunk.sync('./uploads/' + filename, 0, 262);
    var type = fileType(buffer);

    if (!type)
    {
        successFalseCb("unsupported file", callback);
        return;
    }

    var newFilename = uuidGen.v1() + '.' + type.ext;
    var resolution = '';

    async.series([
        function(series_callback) {
            if (type.mime.includes("video/")) {
                
                debugger;
                ffmpeg("./uploads/"+filename)
                    .output('./uploads/' + filename + '.mp4')
                    // .output(stream)
                    .audioCodec('libfaac')
                    // .audioCodec('libfdk_aac')
                    .videoCodec('libx264')
                    .on('end', function() {
                        fs.unlink("./uploads/"+filename);
                        newFilename = newFilename.replace("." + type.ext, '.mp4');
                        filename = filename + '.mp4';
                        series_callback();
                    })
                    .run();
            }
            else {
                series_callback();
            }
        },
        function(series_callback) {
            debugger;
            var client = s3.createClient({
                    s3Options: {
                        accessKeyId: config.s3_config.ACCESS_KEY,
                        secretAccessKey: config.s3_config.SECRECT_KEY,
                        region: 'us-west-2'
                    }
            });

            var uploader = client.uploadFile({
               localFile: "uploads/"+filename,
               s3Params: {
                 Bucket: config.s3_config.BUCKET_NAME,
                 Key: newFilename
               }
            });

            uploader.on('error', function(err) {
               console.error("unable to upload:", err.stack);
               successFalseCb(err, callback);
            });

            uploader.on('progress', function() {
                console.log("progress", uploader.progressMd5Amount,
                uploader.progressAmount, uploader.progressTotal);
            });

            uploader.on('end', function() {
                var uploadedPath = s3.getPublicUrl(config.s3_config.BUCKET_NAME, newFilename, "");
                console.log("FILE UPLOADED", uploadedPath);
                uploadedPath = uploadedPath.replace('s3', 's3-us-west-2');
                console.log("PATH", uploadedPath);
                //Saving the file in the database

                if(type.mime.includes("image/")) {
                    debugger;
                    async.series([
                        function(series_callback2) {
                            gm('./uploads/' + filename)
                                .size(function(err, size) {
                                    if(!err) {
                                        var resolution = size.width + ' x ' + size.height;
                                        addMediaFile(project_id, uploadedPath, resolution, filename, callback);
                                        series_callback2(); 
                                    }
                                });
                              
                        },
                        function(series_callback2) {
                            fs.unlink("./uploads/"+filename);
                            series_callback2();
                        }
                    ], function(err) {
                        if (err)
                            successFalseCb(err, callback);
                        series_callback();
                    });
                        
                } else if (type.mime.includes("video/")) {
                    debugger;
                    async.series([
                        function(series_callback2) {
                            
                            ffmpeg.ffprobe('./uploads/' + filename, function(err, metadata) {
                                if (err) {
                                    console.error(err);
                                } else {
                                    // metadata should contain 'width', 'height' and 'display_aspect_ratio'
                                    // console.log(metadata);
                                    var resolution = metadata.streams[0].width + ' x ' + metadata.streams[0].height;
                                    addMediaFile(project_id, uploadedPath, resolution, filename, callback);
                                }
                                series_callback2();
                            });
                        },
                        function(series_callback2) {
                            fs.unlink("./uploads/"+filename);
                            series_callback2();
                        }
                    ], function(err) {
                        if (err)
                            successFalseCb(err, callback);
                        series_callback();
                    });
                }
            });
        }
    ]);
    
}


function saveMediaFile(project_id, file_path, callback) {
        download(file_path, './uploads/')
            .on('close', function () {
                console.log('One file has been downloaded.');
                var filename = path.basename(file_path);

                putMediaToS3bucketAndSaveToDB(project_id, filename, callback);
            });
}

function addMediaFile(projectId, path, resolution, filename, callback) {
    try {

        query('INSERT INTO public.media_file (project_id, path, order_in_project, resolution, name) VALUES ($1, $2, (SELECT COALESCE(MAX(order_in_project), 0) + 1 AS order_in_project_max FROM public.media_file WHERE project_id = $1), $3, $4) RETURNING id, path, order_in_project, resolution, name;', [projectId, path,  resolution, filename], function(err, result) {
            if (err) {
                successFalseCb(err, callback);
            } else {
                var row = result.rows[0];
                if (row != null) {
                        successCb(callback, {
                                'media_file_id': row.id,
                                'path': row.path,
                                'order_in_project': row.order_in_project,
                                'resolution': row.resolution,
                                'name': row.name
                        });
                } else {
                    successFalseCb('result row is null for the query', callback);
                }
            }
        });
    } catch (err) {
            console.log('error in method addMediaFile: ' + err);
            successFalseCb(err, callback);
    }
    
}

function getMediaFileList(projectId, callback) {
    console.log('call method getMediaFileList: projectId = ' + projectId);
        try {
                query('SELECT * from public.media_file where project_id = $1', [projectId], function(err, result) {
                        if (err) {
                                successFalseCb(err, callback);
                                return;
                        }
                        successCb(callback, {
                                'media_file_list': result.rows
                        });
                });
        } catch (err) {
                console.log('error in method getMediaFileList: ' + err);
                successFalseCb(err, callback);
        }
}

function getProjectData(projectId, callback) {
        console.log('call method getProjectData: projectId = ' + projectId);
        try {
                query('SELECT * from public.project where id = $1', [projectId], function(err, result) {
                        if (err) {
                                successFalseCb(err, callback);
                                return;
                        }
                        var project = result.rows[0];
            getMediaFileList(projectId, function(err1, result1) {
                if (err1) {
                                    successFalseCb(err1, callback);
                                    return;
                            }
                if (result.success == false) {
                    successFalseCb(result1.msg, callback);
                    return;
                }
                successCb(callback, {
                                    'project_data': project,
                    'media_files': result1.media_file_list
                            });

            });
                });
        } catch (err) {
                console.log('error in method getProjectData: ' + err);
                successFalseCb(err, callback);
        }
}

function getUserInfoById(id, callback) {
        console.log('call method getUserInfoById: id = ' + id);
        try {
                query('SELECT * from public.user where id = $1', [id], function(err, result) {
                        if (err) {
                                successFalseCb(err, callback);
                                return;
                        }
                        var user = result.rows[0];
                        //console.log(JSON.stringify(user));
                        if (callback != null) {
                                callback(null, user);
                        }
                });
        } catch (err) {
                console.log('error in method getUserInfoById: ' + err);
                successFalseCb(err, callback);
        }
}

function getUserIdByResetCode(resetCode, callback) {
    console.log('call method getUserIdByResetCode: resetCode = ' + resetCode);
    try {
                query('SELECT user_id from public.reset_password where code = $1', [resetCode], function(err, result) {
                        if (err) {
                                successFalseCb(err, callback);
                                return;
                        }
            var row = result.rows[0];
            if (!row) {
                successCb(callback, {
                    'userId': null
                });
                return;
            }
                        var userId = result.rows[0].user_id;
            successCb(callback, {
                'userId': userId
            });
                });
        } catch (err) {
                console.log('error in method getUserIdByResetCode: ' + err);
                successFalseCb(err, callback);
        }

}

function isEmailExists(email, callback) {
    console.log('call method isEmailExists, email = ' + email);
    try {
                query('SELECT count(*) from public.user where email = $1', [email], function(err, result) {
            if (err) {
                successFalseCb(err, callback);
                                return;
                        }

            //console.log(count);

            var count = result.rows[0];
            var emailExists = count.count != 0;
            console.log('result of method isEmailExists: ' + emailExists);
                    if (callback != null) {
                                callback(null, emailExists);
                        }
        });
    } catch (err) {
            console.log('error in method isEmailExists: ' + err);
        successFalseCb(err, callback);
    }
}

function isProjectExists(userId, projectName, callback) {
        console.log('call method isProjectExists, userId = ' + userId + ', projectName = ' + projectName);
    
        try {
                query('SELECT count(*) from public.project where user_id = $1 and project_name = $2', [userId, projectName], function(err, result) {
                        if (err) {
                successFalseCb(err, callback);
                return;
            }
                        //console.log(count);

                        var count = result.rows[0];
                        var projectExists = count.count != 0;
                        console.log('result of method isProjectExists: ' + projectExists);
                        if (callback != null) {
                                callback(null, projectExists);
                        }
                });
        } catch (err) {
                console.log('error in method isProjectExists: ' + err);
        successFalseCb(err, callback);
        }
}

var io1 = require('socket.io').listen(3040);

function checkIfNotEmptyMessage(socket, message, methodName, cb) {
    if (message == null) {
        socket.emit(methodName, {
                    'success': false,
                        'msg': 'message is empty'
                });
        return;
    }
    //if message is not empty - proceed
    if (cb != null) {
        cb();
    }
}

function authRequiredCall(socket1, methodName, cb) {
    if (cb == null) {
        throw new Errow('error: method ' + methodName + ' has no callback');
    }
        socket1.on(methodName, function(message) {
                console.log('received ' + methodName + ' message: ' + JSON.stringify(message));
                checkIfNotEmptyMessage(socket1, message, methodName + '_response', function() {
                        var projectName = message.project_name;
                        var token = message.token;
                        checkToken(token, function(err, result) {
                                if (err) {
                                        socket1.emit(methodName + '_response', {
                                                'success': false,
                                                'msg': 'check token error: ' + err
                                        });
                                        return;
                                }
                                var userInfo = result;
                                console.log('Token parse result: ' + JSON.stringify(result));
                cb(userInfo, message);
                        });
                });
        });
}

io1.on('connection', function(socket1) {
    console.log("client connected");

    //reset password
    socket1.on('reset_password', function(message) {
        console.log('received reset_password message: ' + JSON.stringify(message));
                checkIfNotEmptyMessage(socket1, message, 'reset_password_response', function() {
            var password = message.password;
            var pass2 = message.confirm_password;
            var resetCode = message.reset_code;
            if (password != pass2) {
                console.log('send reset_password_response: password and confirm_password are not equal');
                socket1.emit('reset_password_response', {
                                    'success': false,
                                        'msg': 'password and confirm_password are not equal'
                                });
                return;
            }
            getUserIdByResetCode(resetCode, function(err, result) {
                if (result.success == false) {
                    console.log('send reset_password_response: ' + result.msg);
                                        socket1.emit('reset_password_response', result);
                    return;
                } 
                var userId = result.userId;
                if (!userId) {
                    var result = {
                        'success': false,
                        'msg': 'user not found'
                    };
                                        console.log('send reset_password_response: user not found');
                                        socket1.emit('reset_password_response', result);
                    return;
                }
                getUserInfoById(userId, function(err1, result1) {
                    if (result.success == false) {
                        console.log('send reset_password_response: ' + JSON.stringify(result1));
                        socket1.emit('reset_password_response', result1);
                        return;
                    }
                    //passwords are equal, reset_code exists - updateUser, set new password
                    var fields = [
                        {
                            'name': 'password',
                            'value': password
                        }
                    ];
                    updateUserFields(userId, fields, function(err2, result2) {
                        deleteResetPasswordEntry(userId, function(err3, result3) {
                            if (err2) {
                                                            console.log('send reset_password_response: ' + JSON.stringify(result3));
                                                        socket1.emit('reset_password_response', result3);

                                                            return;
                                                    }
                        
                                        console.log('send reset_password_response: ' + JSON.stringify(result3));
                                        socket1.emit('reset_password_response', result3);
                        });
                    });
                });
            });
        });
    });

    //signup method
    socket1.on('signup', function(message)      {
            console.log('received singup message: ' + JSON.stringify(message));
        checkIfNotEmptyMessage(socket1, message, 'signup_response', function() {
            var email = message.email;
                    var password = message.password;
                    var name = message.name;
            var frontPath = message.front_path;
                    
            var notFilledFields = [];
            var notFilledMessage = 'Required fields are not filled: ';
            if (!email) {
                notFilledFields.push('email');
            }
            if (!name) {
                notFilledFields.push('name');
            }
                        if (!password) {
                                notFilledFields.push('password');
                        }
            if (notFilledFields.length > 0) {
                successFalseCb(notFilledMessage + notFilledFields.toString(), function(err, result) {
                    console.log('send signup response - required fields are not filled: ' + notFilledFields.toString());
                    socket1.emit('signup_response', result);
                });
                return;
            }

            createUser(email, password, name, function(err, result) {
                            console.log('send singup result: ' + JSON.stringify(result));
//                          socket1.emit('signup_response', result);
                var userId = result.user_id;
                var uuid = uuidGen.v4();
                if (result.success == false) {
                    socket1.emit('signup_response', result);
                    return;
                }
                createEmailConfirmationEntry(userId, uuid, function (err1, result1) {
                    if (result1 && result1.success) {
                        var link = frontPath + uuid;
                        console.log('link: ' + link);
                        sendConfirmationEmail(email, userId, link, function(err2, result2) {
                            console.log('sendConfirmationEmail result: ' + JSON.stringify(result2));
                            //emit initial result (success = true)
                            socket1.emit('signup_response', result);
                        });
                    } else {
                        socket1.emit('signup_response', {
                            'success': false,
                            'msg': err1
                        });
                    }
                });
                    });
        });
    });

    socket1.on('forgot_password', function(message) {
        console.log('received forgot_password message: ' + JSON.stringify(message));
                checkIfNotEmptyMessage(socket1, message, 'forgot_password', function() {
            var email = message.email;
            var frontPath = message.front_path;
            var uuid = uuidGen.v4();
            getUserInfo(email, function(err0, user) {
                if (err0) {
                    successFalseCb(err0, callback);
                                    return;
                }
                var userId = user.id;
                createResetPasswordEntry(userId, uuid, function(err, result) {
                    if (err) {
                        socket1.emit('forgot_password_response', {
                                               'success': false,
                                                   'msg': err
                                            });
                        return;
                    }
                    var link = frontPath + uuid;
                    console.log('link: ' + link);
                    sendResetPasswordEmail(email, link, function(err1, result1) {
                        console.log('sendResetPasswordEmail result: ' + JSON.stringify(result1));
                                            socket1.emit('forgot_password_response', result1);
                    });
                });
            });
        });

    });

    //authenticate method
        socket1.on('authenticate', function(message) {
        console.log('received authenticate message: ' + JSON.stringify(message));
        checkIfNotEmptyMessage(socket1, message, 'authenticate_response', function() {
            var login = message.login;
                    var password = message.password;
                
            checkAuth(login, password, function(err, result) {
                console.log('send authenticate result: ' + JSON.stringify(result));
                socket1.emit('authenticate_response', result);
            });
        });
    });

    authRequiredCall(socket1, 'create_project', function(userInfo, message) {
        var projectName = message.project_name;
        createProject(userInfo.id, projectName, function(err, result) {
                    console.log('send create project response: ' + JSON.stringify(result))
                        socket1.emit('create_project_response', result);
                });

    });

    authRequiredCall(socket1, 'project_list', function(userInfo) {
        projectList(userInfo.id, function(err, result) {
                    console.log('send project list response: ' + JSON.stringify(result))
                        socket1.emit('project_list_response', result);
        });
    });


    authRequiredCall(socket1, 'delete_project', function(userInfo, message) {
            deleteProject(message.project_id, function(err, result) {
                    console.log('send delete_project response: ' + JSON.stringify(result))
                    socket1.emit('delete_project_response', result);
            });
    });

    authRequiredCall(socket1, 'delete_image', function(userInfo, message) {
            deleteImage(message.file_path, function(err, result) {
                    console.log('send delete_image response: ' + JSON.stringify(result))
                    socket1.emit('delete_image_response', result);
            });
    });

    

    authRequiredCall(socket1, 'confirmate_email', function(userInfo, message) {
                confirmateEmail(userInfo.id, message.email_code, function(err, result) {
                        console.log('send confirmate_email response: ' + JSON.stringify(result))
                        socket1.emit('confirmate_email_response', result);
                });
        });

        authRequiredCall(socket1, 'update_project', function(userInfo, message) {
                updateProjectFields(message.project_id, message.fields, function(err, result) {
                        console.log('send update_project response: ' + JSON.stringify(result))
                        socket1.emit('update_project_response', result);
                });
        });

        authRequiredCall(socket1, 'update_user', function(userInfo, message) {
                updateUserFields(message.user_id, message.fields, function(err, result) {
                        console.log('send update_user response: ' + JSON.stringify(result))
                        socket1.emit('update_user_response', result);
                });
        });

    authRequiredCall(socket1, 'project_data', function(userInfo, message) {
                getProjectData(message.project_id, function(err, result) {
                        console.log('send project_data response: ' + JSON.stringify(result))
                        socket1.emit('project_data_response', result);
                });
        });


        authRequiredCall(socket1, 'media_file_add', function(userInfo, message) {
                saveMediaFile(message.project_id, message.path, function(err, result) {
                        console.log('send media_file_add response: ' + JSON.stringify(result))
                        socket1.emit('media_added', result);
                });
        });

        authRequiredCall(socket1, 'google_file_add', function(userInfo, message) {
                // addMediaFile(message.project_id, message.path, function(err, result) {
                //         console.log('send media_file_add response: ' + JSON.stringify(result))
                //         socket1.emit('media_added', result);
                // });
                saveGoogleFile(message, function(err, result) {
                        console.log('send google file add response: ' + JSON.stringify(result))
                        socket1.emit('media_added', result);
                });
        });

        ss(socket1).on('media_file_add', function(stream, data) {
            var filename = path.basename(data.name);

            var writeStream = fs.createWriteStream("uploads/"+filename);
            stream.pipe(writeStream);

            writeStream.on('close', function(){

                putMediaToS3bucketAndSaveToDB(data.project_id, filename, function(err, data) {
                            console.log("Saving in database", err, data);
                            socket1.emit('media_added', data);
                    });
            });
        });

        authRequiredCall(socket1, 'schedule_task', function(userInfo, message) {
                scheduleTask(message.project_id, message.start_date, message.target_social_network, message.title, message.description, function(err, result) {
                        console.log('send schedule_task response: ' + JSON.stringify(result))
                        socket1.emit('schedule_task_response', result);
                });
        });
});