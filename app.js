//carregando modulos
    const express= require('express');
    const handlebars= require('express-handlebars');
    const bodyParser= require('body-parser');
    const app = express();
    const admin= require('./routes/admin'); 
    const path = require('path');
    const mongoose= require('mongoose');  
    const session = require('express-session');
    const flash = require('connect-flash');

//Configurações
    //Session
        app.use(session({
            secret: "cursodenode",
            resave: true,
            savedUninitialized: true
        }));
        app.use(flash());
    //Middlewares
        app.use((req,res,next)=>{
            res.locals.success_msg = req.flash("success_msg");
            res.locals.error_msg = req.flash("error_msg");
            next();
        });
    //Body Parser
        app.use(bodyParser.urlencoded({extended:true}));
        app.use(bodyParser.json());
    //Handlebars
        app.engine('handlebars', handlebars({default: 'main'}));
        app.set('view engine', 'handlebars');
    //Mongoose

        mongoose.Promise = global.Promise;
        mongoose.connect('mongodb://localhost/blogapp',{
            useNewUrlParser:true
        }).then(() => {
            console.log('Conectado com sucesso!');
        }).catch((err) => {
            console.log('Aconteceu um erro' + err);
        })



    //Public 
        app.use(express.static('public'));
        //middleware
        app.use((req,res, next)=>{
            console.log('sou middleware');
            next();
        })


//Rotas
    app.use('/admin', admin);

//Outros definindo porta da aplicação
const PORT = 8081
app.listen(PORT, ()=>{
    console.log('Servidor Rodando')
});