const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const equipes = [];
let jogadores = [];

app.use(session({
  secret: 'chave-secreta', 
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 30 * 60 * 1000 } 
}));

app.get('/', (req, res) => {
  res.redirect('/login');
});


const usuarioPadrao = {
  username: 'admin',
  password: '1234'
};

function autenticar(req, res, next) {
  if (req.session.logado) {
    next();
  } else {
    res.redirect('/login');
  }
}

app.get('/login', (req, res) => {
  res.render('login', { mensagem: null });
});

app.post('/login', (req, res) => {
  const { usuario, senha } = req.body;

  if (usuario === 'admin' && senha === '123') {
    req.session.logado = true;

   
    res.cookie('ultimoAcesso', new Date().toLocaleString(), { maxAge: 30 * 60 * 1000 });

    res.redirect('/menu');
  } else {
    res.render('login', { mensagem: 'Login inválido. Tente novamente.' });
  }
});




app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});



app.get('/menu', autenticar, (req, res) => {
  const ultimoAcesso = req.cookies.ultimoAcesso || 'Primeiro acesso';
  res.render('menu', { ultimoAcesso });
});

app.get('/cadastro-equipe', autenticar, (req, res) => {
  res.render('cadastroEquipe');
});

app.get('/cadastro-jogador', autenticar, (req, res) => {
  res.render('cadastroJogador', { equipes });
});

app.get('/lista-jogadores', autenticar, (req, res) => {
  res.render('listaJogadores', { jogadores });
});

app.get('/lista-equipes', autenticar, (req, res) => {
  res.render('listaEquipes', { equipes });
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});


module.exports = app;




app.post('/cadastro-jogador', autenticar, (req, res) => 
{
console.log(req.body);
    const { nome, numero, dataNascimento, altura, genero, posicao, equipe } = req.body;

  if (!nome || !numero || !dataNascimento || !altura || !genero || !posicao || !equipe) {
    return res.send('Todos os campos são obrigatórios. <a href="/cadastro-jogador">Voltar</a>');
  }

 
  const equipeExiste = equipes.find(eq => eq.nomeEquipe === equipe);
  if (!equipeExiste) {
    return res.send('Equipe inválida. <a href="/cadastro-jogador">Voltar</a>');
  }

 
  jogadores.push({
    nome,
    numero,
    dataNascimento,
    altura,
    genero,
    posicao,
    equipe
  });

  
  res.redirect('/lista-jogadores');
});

app.post('/cadastro-equipe', autenticar, (req, res) => {
    const { nomeEquipe, tecnico, telefone } = req.body;

    if (!nomeEquipe || !tecnico || !telefone) {
        return res.render('cadastroEquipe', { 
            sucesso: null, 
            erro: 'Todos os campos são obrigatórios.' 
        });
    }

    const equipeExiste = equipes.find(eq => eq.nomeEquipe === nomeEquipe);
    if (equipeExiste) {
        return res.render('cadastroEquipe', { 
            sucesso: null, 
            erro: 'Equipe já cadastrada.' 
        });
    }

    equipes.push({
        nomeEquipe,
        tecnico,
        telefone
    });

    res.render('cadastroEquipe', { 
        sucesso: 'Equipe cadastrada com sucesso!', 
        erro: null 
    });
});


