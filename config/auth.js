const localStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Model de usuário
require('../models/Usuario');
const Usuario = mongoose.model('usuarios');

module.exports = function(passport) {//configurar sistema de autenticação
    passport.use(new localStrategy({ usernameField: 'email', passwordField: 'senha' }, (email, senha, done) => {
        Usuario.findOne({ email: email }).then(usuario => {
            if(!usuario) {
                return done(null, false, { message: 'Está conta não existe' });
            };

            bcrypt.compare(senha, usuario.senha, (err, batem) => {
                if(batem) {
                    return done(null, usuario);
                } else {
                    return done(null, false, { message: 'Senha incorreta' });
                }
            });
        });
    }));

    passport.serializeUser((usuario,done) => {//salvar os daods do usuario numa sessao
        done(null, usuario.id);
    });

    passport.deserializeUser((id,done) => {//procurar usuario por id
        Usuario.findById(id, (err, usuario) => {
            done(err, usuario);
        });
    });


}