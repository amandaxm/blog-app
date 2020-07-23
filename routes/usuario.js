const express = require('express');
const routes = express.Router();
const mongoose = require('mongoose');
require('../models/Usuario');

const Usuario = mongoose.model("usuarios")

const bcrypy = require('bcryptjs');

//const passport = require('passport');

routes.get('/registro', (req,res) => {
    res.render('usuario/registro')
});

routes.post('/registro', (req,res) => {
    const erros = [];

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null ) {
        erros.push({ texto: 'Nome inválido'});
    };

    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null ) {
        erros.push({ texto: 'E-mail inválido'});
    };

    if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null ) {
        erros.push({ texto: 'Senha inválida'});
    };
    
    if(req.body.senha.length < 4) {
        erros.push({ texto: 'Senha muito curta'});
    };

    if(req.body.senha != req.body.senha2) {
        erros.push({ texto: 'As senhas são diferentes, tente novamente!'});
    };

    if(erros.length > 0) {
        res.render('usuario/registro', { erros: erros });
    } else {
        Usuario.findOne({email: req.body.email}).then((usuario)=>{     if(usuario) {
                req.flash('error_msg', 'E-mail já cadastrado');
                res.redirect('/usuarios/registro');
            } else {
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha,
                });

                bcrypy.genSalt(10, (err, salt) => {
                    bcrypy.hash(novoUsuario.senha, salt, (err,hash) => {
                        if(err) {
                            req.flash('error_msg', 'Houve um erro no salvamento do usuário');
                            res.redirect('/');
                        };

                        novoUsuario.senha = hash;
                        novoUsuario.save().then(() => {
                            req.flash('success_msg', 'Usuário criado com sucesso!');
                            res.redirect('/');
                        }).catch(err => {
                            req.flash('error_msg', 'Houve um erro ao criar usuário, tente novamente!');
                            res.redirect('/usuarios/registro');
                        })
                    });
                });
            }
        }).catch(err => {
            req.flash('error_msg', 'Houve um erro interno');
            res.redirect('/');
        });
    }
});


module.exports = routes;