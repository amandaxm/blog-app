const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Postagem = new Schema({

    titulo:{
        type: String,
        required: true
    },
    slug:{
        type: String,
        required:true
    },

    descricao:{
        type: String,
        required:true
    },

    conteudo:{
        type: String,
        required:true
    },
    categoria:{
        type: Schema.Types.ObjectId,
        ref: "categorias"
    },
    data:{
        type: Date,
        default: Date.now()
    }
    
    //SLUG sera um tipo de link a categoria
})
//criar uma collection chamada postagens, feita com base no modulo Postages
mongoose.model('postagens', Postagem);