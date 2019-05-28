'use strict';

const nodeMailer = require('nodemailer');

/**
 * @param {Object} params 
 * @return {Object}
 */
module.exports.send = (userEmail) => {
    console.log(userEmail);
	let transporter = nodeMailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'scm.maysoethinzarmoe@gmail.com',
            pass: 'fresherwelcome'
        },
        tls: {
            rejectUnauthorized: false
        }
    });
    let mailOptions = {
        from: '"Book Shop"', 
        to: userEmail, 
        subject: "Sign up completed message", 
        text: "Complete Successfully", 
        html: '<b>Signed up Successfully . Welcome to Book Shop .</b>' 
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message %s sent: %s', info.messageId, info.response);
            res.render('index');
    });
};