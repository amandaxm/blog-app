const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');//importa
const { RSA_PKCS1_OAEP_PADDING } = require('constants');
require('../models/Categoria');
require('../models/Postagem');//chama o arquivo do model
const Categoria = mongoose.model('categorias')//passa a referencia do model para uma variavel
const Postagem = mongoose.model('postagens')//passa a referencia do model para uma variavel

//definindo routes

router.get('/categorias', (req, res) => {
    //listar todas as categorias
    Categoria.find().sort({ date: 'desc' }).lean().then((categorias) => {
        //passar categorias para a pagina
        res.render('admin/categorias', { categorias: categorias });

    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao listar as categorias');
        res.redirect('/admin');
    })
})

router.get('/categorias/add', (req, res) => {
    res.render('admin/addcategorias');
})


router.post('/categorias/nova', (req, res) => {

    let erros = [];

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({ texto: 'Nome inválido' });
    };

    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({ texto: 'Slug inválido' });
    };

    if (req.body.nome.length < 2) {
        erros.push({ texto: 'Nome da categoria é muito pequeno' });
    };

    if (erros.length > 0) {
        res.render('admin/addcategorias', { erros: erros });
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

router.get('/categorias/edit/:id', (req, res) => {
    Categoria.findOne({ _id: req.params.id }).lean().then((categoria) => {//recebemos categoria e passamos para a view
        res.render('admin/editcategoria', { categoria: categoria });//view handlebar
    }).catch((err) => {
        req.flash('error_msg', "Essa categoria não existe")
        res.redirect('/admin/categorias');
    })
})

router.post('/categorias/edit', (req, res) => {

    Categoria.findOne({ _id: req.body.id }).then(categoria => {

        let erros = [];

        if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
            erros.push({ texto: 'Nome inválido' });
        };

        if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
            erros.push({ texto: 'Slug inválido' });
        };

        if (req.body.nome.length < 2) {
            erros.push({ texto: 'Nome da categoria é muito pequeno' });
        };

        if (erros.length > 0) {
            req.flash('error_msg', 'Erro de validação');

            res.redirect('admin/categorias', { erros: erros });

        } else {

            categoria.nome = req.body.nome;
            categoria.slug = req.body.slug;

            categoria.save().then(() => {
                req.flash('success_msg', 'Categoria editada com sucesso');
                res.redirect('/admin/categorias');

            }).catch(err => {
                res.flash('error_msg', 'Houve um erro interno ao salvar a edição da categoria');
                res.redirect('/admin/categorias');
            });
        }
    }).catch(err => {
        req.flash('error_msg', 'Houve um erro ao editar a categoria');
        res.redirect('/admin/categorias');
    });
});

router.post('/categorias/deletar/:id', (req, res) => {
    Categoria.findOneAndDelete({ _id: req.params.id }).then(() => {
        req.flash('success_msg', 'Categoria deletada com sucesso')
        res.redirect('/admin/categorias')
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao deletar a categoria')
        res.redirect('/admin/categorias')
    })
})

router.get("/postagens", (req, res) => {
    Postagem.find().lean().populate('categoria').sort({ data: 'desc' }).then(postagens => {
        res.render('admin/postagens', { postagens: postagens });
    }).catch(err => {
        req.flash('error_msg', 'Houve um erro ao listar as postagens');
        res.redirect('/admin');
    })
})


router.get("/postagens/add", (req, res) => {
    Categoria.find().lean().then((categorias) => {
        res.render('admin/addpostagens', { categorias: categorias });
    }).catch((err => {
        req.flash('error_msg', "Houve um erro ao criar postagem");
        res.redirect('/admin');

    }))

})

router.post('/postagens/nova', (req, res) => {
    const erros = [];
    if (req.body.categoria == '0') {
        erros.push({ texto: 'Categoria inválida, registre uma categoria' });
    }

    if (erros.length > 0) {
        res.render('admin/addpostagem', { erros: erros });
    } else {
        const novaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug
        }

        new Postagem(novaPostagem).save().then(() => {
            req.flash('success_msg', 'Postagem criada com sucesso!');
            res.redirect('/admin/postagens')
        }).catch(err => {
            req.flash('error_msg', 'Houve um erro durante o salvamento da postagem');
            res.redirect('/admin/postagens');
        });
    }
});

router.get('/postagens/edit/:id', (req, res) => {
    Postagem.findOne({ _id: req.params.id }).lean().then(postagem => {

        Categoria.find().lean().then(categorias => {
            res.render('admin/editpostagens', { categorias: categorias, postagem: postagem });
        }).catch(err => {
            req.flash('error_msg', 'Houve um erro ao listas as categorias');
            res.redirect('/admin/postagens');
        });

    }).catch(err => {
        req.flash('error_msg', 'Houve um erro ao carregar o formulário de edição');
        res.redirect('/admin/postagens');
    });
});

router.post('/postagem/edit', (req, res) => {
    Postagem.findOne({ _id: req.body.id }).then(postagem => {

        postagem.titulo = req.body.titulo;
        postagem.slug = req.body.slug;
        postagem.descricao = req.body.descricao;
        postagem.conteudo = req.body.conteudo;
        postagem.categoria = req.body.categoria;

        postagem.save().then(() => {
            req.flash('success_msg', 'Postagem editada com sucesso');
            res.redirect('/admin/postagens');

        }).catch(err => {
            res.flash('error_msg', 'Houve um erro interno ao salvar a edição da categoria');
            res.redirect('/admin/postagens');
        });

    }).catch(err => {
        req.flash('error_msg', 'Houve um erro ao editar a postagem');
        res.redirect('/admin/postagens');
    });
});


router.post('/postagens/deletar/:id', (req, res) => {
    Postagem.findOneAndDelete({ _id: req.params.id }).then(() => {
        req.flash('success_msg', 'Categoria deletada com sucesso')
        res.redirect('/admin/postagens')
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao deletar a categoria')
        res.redirect('/admin/postagens')
    })
})
module.exports = router;