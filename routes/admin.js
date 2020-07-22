const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');//importa
const { RSA_PKCS1_OAEP_PADDING } = require('constants');
require('../models/Categoria');//chama o arquivo do model
const Categoria = mongoose.model('categorias')//passa a referencia do model para uma variavel
//definindo routes

    router.get('/', (req, res)=>{
        res.render('admin/index');
    })

    router.get('/posts', (req,res)=>{
        res.send('Pagina de Posts');
    })
    router.get('/categorias', (req,res)=>{
        //listar todas as categorias
        Categoria.find().sort({date: 'desc'}).lean().then((categorias)=>{
            //passar categorias para a pagina
            res.render('admin/categorias',{categorias: categorias});

        }).catch((err)=>{
            req.flash('error_msg', 'Houve um erro ao listar as categorias');
            res.redirect('/admin');
        })
        
        
        
        
        
    
    
    
    
    })

    router.get('/categorias/add', (req,res)=>{
        res.render('admin/addcategorias');
    })

    router.post('/categorias/nova', (req, res) => {

        let erros = [];
    
        if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null ) {
            erros.push({ texto: 'Nome inválido' });
        };
    
        if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
            erros.push({ texto: 'Slug inválido' });
        };
    
        if(req.body.nome.length < 2) {
            erros.push({ texto: 'Nome da categoria é muito pequeno' });
        };
    
        if(erros.length > 0) {
            res.render('admin/addcategorias', {erros: erros});
        } else {
            const novaCategoria = {
                nome: req.body.nome,
                slug: req.body.slug
            }
        
            new Categoria(novaCategoria).save().then(() => {
                req.flash('success_msg', 'Categoria criada com sucesso');
                res.redirect('/admin/categorias');
            }).catch(err => {
                req.flash('error_msg', 'Houve um erro ao salvar a categoria, tente novamente');
                res.redirect('/admin');
            })
        }
    });



module.exports = router;