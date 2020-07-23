//carregando modulos
const express = require('express');
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const app = express();
const admin = require('./routes/admin');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
require('./models/Postagem');
const Postagem = mongoose.model("postagens")
//Configurações
//Session
app.use(session({
    secret: "cursodenode",
    resave: true,
    savedUninitialized: true
}));
app.use(flash());
//Middlewares
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    next();
});
//Body Parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//Handlebars
app.engine('handlebars', handlebars({ default: 'main' }));
app.set('view engine', 'handlebars');
//Mongoose

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/blogapp', {
    useNewUrlParser: true
}).then(() => {
    console.log('Conectado com sucesso!');
}).catch((err) => {
    console.log('Aconteceu um erro' + err);
})



//Public 
app.use(express.static('public'));
//middleware
app.use((req, res, next) => {
    console.log('sou middleware');
    next();
})


//Rotas

app.get('/', (req, res) => {
    Postagem.find().lean().populate('categoria').sort({data: 'desc'}).then(postagens => {
        res.render('index', { postagens: postagens });//passar postagens para view
    }).catch(err => {
        req.flash('msg_error', 'Houve um erro interno');
        res.redirect('/404');
    })
})

app.get('/404', (req,res) => {
    res.send('Erro 404!');
});

app.get('/postagem/:slug', (req,res) => {
    Postagem.findOne({ slug: req.params.slug }).lean().then(postagem => {
        if(postagem) {
            res.render('postagem/index', { postagem: postagem });
        } else {
            req.flash('error_msg', 'Esta postagem não existe');
            res.redirect('/');
        }
    }).catch(err => {
        req.flash('error_msg', 'Houve um erro interno');
        res.redirect('/');
    })
});

app.get('/categorias', (req, res) => {
    Categoria.find().then(categorias => {
        res.render('categorias/index', { categorias: categorias });
    }).catch(err => {
        req.flash('error_msg', 'Houve um erro interno');
        res.redirect('/');
    })
});

app.get('/categorias/:slug', (req,res) => {
    Categoria.findOne({ slug: req.params.slug }).then(categoria => {
        if(categoria) {
            Postagem.find({ categoria: categoria._id }).then(postagens => {
                res.render('categorias/postagens', { postagens: postagens, categoria: categoria });
            }).catch(err => {
                req.flash('error_msg', 'Houve um erro ao listar os posts');
                res.redirect('/');
            })
        } else {
            req.flash('error_msg', 'Esta categoria não existe');
            res.redirect('/');
        }
    }).catch(err => {
        req.flash('error_msg', 'Houve um erro interno ao carregar a página desta categoria');
        res.redirect('/');
    })
});



app.use('/admin', admin);

//Outros definindo porta da aplicação
const PORT = 8081
app.listen(PORT, () => {
    console.log('Servidor Rodando')
});