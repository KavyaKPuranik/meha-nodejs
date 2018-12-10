var cron = require('node-schedule');
var config = require('./webapp/conf/config.json');
var log = require('./logger/logger')(module);
var mailer = require('./mailer');
var db = require('./database');
var date = new Date();
var scheduleDoctorReport = cron.scheduleJob(config.reporting_time, function()
{
    var subject = "Daily Summary of Chatbot usage";
    var content = "Daily Summary of Chatbot usage is as follows";
    var htmlContent = "<div><p><b>Following is the Daily Summary of NIMHANS Mental Health Chatbot sent on "+ date+". <b></p><br>"
    htmlContent += "<table border='1'>"+
    "<tr>"+
    "<th>Duration in minutes</th>"+
    "<th>Screener Score</th>"+
    "<th>WHO Score</th>"+
    "<th>Feeling</th>"+
    "<th>User email</th>"+
    "</tr>";
  
    db.selectQuery("summary",function(result)
        {   
            log.debug(result);
            for ( var i in result) 
             {
                if(result[i].duration === undefined)
                    break;
                var duration = result[i].duration;
                var screener_score = result[i].screener_score;
                if(screener_score == -999){
                    screener_score = "NA";
                }
                var who_score = result[i].who_score;
                if(who_score == -999){
                    who_score = "NA";
                }
                var feeling = result[i].feeling;
                var useremail = result[i].email;
                
                htmlContent += "<tr><td>"+duration+"</td><td>"+screener_score+"</td><td>"+who_score+"</td>"+
                "<td>"+feeling+"</td><td>"+useremail+"</td></tr>";
            }
            htmlContent += "</table><p><b>NA : Not Available</b></p></div>";
            htmlContent += "<div><p><b>Following is the Chatbot Ratings and Feedbacks from users</b></p><br></div><div><table border='1'>"+
                "<tr>"+
                "<th>Chatbot Rating (Out of 5)</th>"+
                "<th>Chatbot Feedback</th>"+
                "</tr>";
            db.selectQuery("chatbot_details",function(result1)
                {   

                    log.debug(result1);

                    for ( var i in result1) {
                        if(result1[i].rating === undefined)
                            break;
                        if(result1[i].reported == 0)
                        {
                            var rating = result1[i].rating;
                            var feedback = result1[i].feedback;
                            htmlContent += "<tr><td>"+rating+"</td><td>"+feedback+"</td></tr>";
                            db.updateQuery("chatbot_details",["reported"],[1],["id"],[result1[i].id],function(){});
                        }
                    }

                    htmlContent += "</table></div>";
                    htmlContent += "<div><p><b>Following is the PUSH-D Ratings and Feedbacks from users</b></p><br></div><div><table border='1'>"+
                        "<tr>"+
                        "<th>Pushd Rating (Out of 5)</th>"+
                        "<th>Pushd Feedback</th>"+
                        "</tr>";
                    db.selectQuery("pushd_details",function(result2)
                        {   

                            log.debug(result2);

                            for ( var i in result2) {
                                if(result2[i].rating === undefined)
                                    break;
                                if(result2[i].reported == 0)
                                {
                                        var ratingpd = result2[i].rating;
                                        var feedbackpd = result2[i].feedback;
                                        htmlContent += "<tr><td>"+ratingpd+"</td><td>"+feedbackpd+"</td></tr>";
                                        db.updateQuery("pushd_details",["reported"],[1],["id"],[result2[i].id],function(){});

                                }
                            }
                            htmlContent += "</table></div>";
                            htmlContent += "<div><p><b>Following is the Wellness App Ratings and Feedbacks from users</b></p><br></div><div><table border='1'>"+
                                "<tr>"+
                                "<th>Wellness app Rating (Out of 5)</th>"+
                                "<th>Wellness app Feedback</th>"+
                                "</tr>";
                            db.selectQuery("wellness_app_details",function(result3)
                                {   

                                    log.debug(result3);

                                    for ( var i in result3) {
                                        if(result3[i].rating === undefined)
                                            break;
                                        if(result3[i].reported == 0)
                                        {   
                                            var ratingWNA = result3[i].rating;
                                            var feedbackWNA = result3[i].feedback;
                                            htmlContent += "<tr><td>"+ratingWNA+"</td><td>"+feedbackWNA+"</td></tr>";
                                            db.updateQuery("wellness_app_details",["reported"],[1],["id"],[result3[i].id],function(){});

                                        }
                                    }
                                    htmlContent += "</table></div>";

                                    log.info('Sending daily report at '+config.reporting_time.hour+':'+config.reporting_time.minute+' to '+config.doctor_email);
                                    mailer.sendMail(config.doctor_email,subject,content,htmlContent,
                                    function(error, response)
                                    {
                                     if(error)
                                     {
                                         log.error("Unable to send daily report");
                                         log.error(error);
                                     }
                                     else
                                     {
                                         log.info("Daily report sent to "+config.doctor_email);
                                          //  db.truncateQuery("summary");
                                         log.error(error);

                                     }
                                    });
                            });
                        });
                 });

    });

    
});

var scheduleChatAdminReport = cron.scheduleJob(config.reporting_time2, function()
{
    db.selectQuery("free_text_details",function(result4)
    {   
        log.debug(result4);
        var mailSubject = "Free text messages and score";
        var mailContent = "A list of all the free text entered by different users along with their corresponding sentiment score.";
        var htmlContents = "<h3>"+mailContent+"</h3>"+
                "<div><table border='1'><tr><th>Free Text</th><th>Score</th></tr>";
        for ( var i in result4) 
        {
            if(result4[i].reported == 0)
            {   
                htmlContents += "<tr><td>"+result4[i].free_text+"</td><td>"+result4[i].senti_score+"</td></tr>";
                db.updateQuery("free_text_details",["reported"],[1],["id"],[result4[i].id],function(){});
            }
        }
        htmlContents += "</table></div>";
        log.info('Sending daily report at '+config.reporting_time.hour+':'+config.reporting_time.minute+' to '+config.chat_admin_email);
        mailer.sendMail(config.chat_admin_email,mailSubject,mailContent,htmlContents,
        function(error, response)
        {
            if(error)
            {
                log.error("Unable to send daily report to chat admin");
                log.error(error);
            }
            else
            {
                log.info("Daily report sent to "+config.chat_admin_email);
            }
        });

    });               
});
             

module.exports = {scheduleDoctorReport,scheduleChatAdminReport}
//module.exports = scheduleDoctorReport