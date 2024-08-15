const User = require('../models/User');
const bcrypt = require('bcryptjs')

class AuthController {
    static login(req,res){
        res.render('auth/login')
    }

    static async loginPost(req,res){
        const {email, password} = req.body;

        //saber se o usuário existe
        const user = await User.findOne({where: {email:email}})
        if(!user){
                req.flash('message', 'Usuário não encontrado!')
                res.render('auth/login');
                return
        }
        // checar se a senha bate com a do banco
        const passwordMatch = bcrypt.compareSync(password, user.password);

        if(!passwordMatch){
            req.flash('message', 'Senha inválida!')
            res.render('auth/login');
            return;
        }
        req.session.userid = user.id;
        req.flash('message', 'Login realizado com sucesso!')
        req.session.save(()=>{
            res.redirect('/')
        })
    }

    static register(req,res){
        res.render('auth/register')
    }

    static async registerPost(req,res){
        const { name, email, password, confirmpassword} = req.body;

        if(password != confirmpassword){
           req.flash('message', 'As senhas não conferem, tente novamente!')
            res.render('auth/register');
            // return;
           // res.redirect('/register');
        }

        // checar se o usuário já existe
        const checkUserExists = await User.findOne({where:{email:email}})

        if(checkUserExists){
            req.flash('message', 'O email já está em uso!')
            res.render('auth/register');
            return;
        }

        // Realizando a encriptação
        const salt = bcrypt.genSaltSync(10)
        const hashedPassword = bcrypt.hashSync(password, salt);

        const user = {
            name: name,
            email:email,
            password: hashedPassword,
        }
        try{
            const createdUser = await User.create(user);
            req.flash('message', 'Cadastro realizado com sucesso!')
            req.session.userid = createdUser.id;

            req.session.save(()=>{
                res.redirect('/')
            })
        }
        catch(err){
            console.log(err)
        }    
    }
        static logout(req,res){
            req.session.destroy();
            res.redirect('/login');
        }

}

module.exports = AuthController;