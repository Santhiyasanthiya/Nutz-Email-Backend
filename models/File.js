const mongoose = require("mongoose");
const nodemailer = require('nodemailer');

const fileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  imageUrl: {
    type: String,
  },

  tag: {
    type: String,
  },

  email: {
    type: String,
  },
});

//post middleware

fileSchema.post("save", async function(doc){
    try {
        console.log("DOC", doc);

        //transporter

        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            auth:{
                user:process.env.MAIL_USER,
                pass:process.env.MAIL_PASS,
            },

        })

        //send mail
        let info = await transporter.sendMail({
            from:'Aditya_Singh',
            to:doc.email,
            subject:"New File Uploaded Successfully",
            html:`<h2>Hello JEE </h2>
            <p>SIya RAm JAi siya RAm view here : <a href ="${doc.imageUrl}">${doc.imageUrl}</a></p>`, 
        })

        console.log("INFO: ", info)

    } catch (error) {

        console.error(error)
    }
})

const File = mongoose.model("file", fileSchema);

module.exports = File;
