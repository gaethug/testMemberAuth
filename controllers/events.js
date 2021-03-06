/**
 * Created with JetBrains PhpStorm.
 * User: hoho
 * Date: 2013. 11. 4.
 * Time: 오전 10:22
 * To change this template use File | Settings | File Templates.
 */

var Event = require('../models/event.js');
var Survey = require('../models/survey.js');
var Email = require('../models/email.js');

exports.index = function(req, res){
    Event.find().sort({_id:-1}).execFind(function(err, docs) {
        if(err){
            res.send({result:"FAIL", ERR:err});
        }else{
            res.send({events:docs, result:"SUCCESS"});
        }
    });
};

exports.show = function(req, res){
    var id = req.params.id;
    Event.findOne({_id:id}).populate("Surveys Emails").exec(function (err, data){
        if(err){
            res.send({result:"FAIL", ERR:err});
        }else{
            res.send({event:data , result:"SUCCESS"});
        }
    });
};

exports.create = function(req, res){
    if(req.user == null){
        res.send({result:"FAIL", ERR:"logged out"});
        return false;
    }else{
        var memberId = req.user._id;
    }
    var event = {
        Title:req.body.Title,
        Memo:req.body.Memo,
        Creator:req.user,
        _Member:memberId
    };
    var eventObj = new Event(event);
    eventObj.save(function(err, data){
        if(err){
            console.log("Create Event Fail");
            res.send({result:"FAIL", ERR:err});
        }else{
            res.send({result: "SUCCESS"});
            /*Member.update({_id: memberId}, {'$push':{Events:data._id}}, function (err,data) {
                console.log(data);
                if (err) {
                    res.send({result:"FAIL", ERR:err});
                } else {
                    res.send({result: "SUCCESS"});
                }
            });*/
        }
    });
};
exports.update = function(req, res){
    var user = {};
    if(req.user == null){
        res.send({result:"FAIL", ERR:"logged out"});
        return false;
    }
    var id = req.params.id;
    var event = {
        Title:req.body.Title,
        Memo:req.body.Memo
    };
    Event.update({_id:id}, event, function(err){
        if(err){
            console.log("update Event Fail");
            res.send({result:"FAIL", ERR:err});
        }else{
            console.log("update Event SUCCESS");
            res.send({result:"SUCCESS"});
        }
    });
};
exports.destroy = function(req, res){

    //두가지 경우
    //1. 부모 이벤트 삭제 시 자식 서베이, 이메일은 유지한다. (멤버에 귀속)
    //2. 부모 이벤트 삭제 시 자식 서베이, 이메일도 함께 제거한다.
    //일단 2로 간다. 멤버 도큐멘트 수정, 서베이, 이메일 제거 후 삭제

    //29131108
    //멤버는 이벤트, 서베이, 이메일에 각각 이너로 붙어 있기 떄문에
    //이벤트 삭제시 걍 지움 됨
    if(req.user == null){
        res.send({result:"FAIL", ERR:"logged out"});
        return false;
    }
    var id = req.params.id;
    Event.findById(id, function (err, doc) {
        if(err){
            res.send({result:"FAIL", ERR:err});
        }else{
            Survey.remove({_Event:id}, function(err){
                if(err){
                    console.log("remove All Fail Surveys On Event");
                }else{
                    console.log("remove All Surveys On Event");
                }
            });
            Email.remove({_Event:id}, function(err){
                if(err){
                    console.log("remove All Fail Emails On Event");
                }else{
                    console.log("remove All Emails On Event");
                }
            });
            doc.remove(function(err){
                if(err){
                    res.send({result:"FAIL", ERR:err});
                }else{
                    res.send({result:"SUCCESS"});
                }
            });
        }
    });
};