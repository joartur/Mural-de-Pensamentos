const Tought = require('../models/Tought')
const User = require('../models/User')
const { Op } = require('sequelize')

class ToughtController {

    static teste(req,res){
        res.status(401).json({message: 'Testando a rota'})
    }


    static async showToughts(req, res) {
        let search = '';
        if (req.query.search) {
            search = req.query.search;
        }
    
        let order = 'DESC';
        if (req.query.order === 'old') {
            order = 'ASC';
        }
    
        const limit = 1; 
        const page = parseInt(req.query.page) || 1; 
    
        const { count, rows: toughtsData } = await Tought.findAndCountAll({
            include: User,
            where: {
                title: { [Op.like]: `%${search}%` }
            },
            order: [['createdAt', order]],
            limit: limit,
            offset: (page - 1) * limit,
        });
    
        const toughts = toughtsData.map((resultado) => resultado.get({ plain: true }));
    
        let toughtsQty = toughts.length;
        const totalPages = Math.ceil(count / limit);
    
        res.render('toughts/home', {
            toughts,
            search,
            toughtsQty,
            totalPages,
            currentPage: page,
            order,
        });
    }

    static async dashboard(req, res) {
        const userId = req.session.userid;
    
        const limit = 1; 
        const page = req.query.page || 1; 
    
        const user = await User.findOne({
            where: { id: userId },
            include: {
                model: Tought,
                limit: limit,
                offset: (page - 1) * limit,
                order: [['createdAt', 'DESC']],
            },
            plain: true,
        });
    
        if (!user) {
            return res.redirect('/login');
        }
    
        const toughts = user.Toughts.map((resultado) => resultado.dataValues);
    
        const toughtsCount = await Tought.count({ where: { UserId: userId } });
        const totalPages = Math.ceil(toughtsCount / limit);
    
        let emptyToughts = false;
        if (toughts.length === 0) {
            emptyToughts = true;
        }
    
        res.render('toughts/dashboard', {
            toughts,
            emptyToughts,
            totalPages,
            currentPage: parseInt(page),
        });
    }
    
    
    static createTought(req,res){
        res.render('toughts/create')
    }

    static async createToughtSave(req,res){
        const tought = {
            title: req.body.title,
            UserId: req.session.userid
        }

        await Tought.create(tought);
        req.flash('message', 'Pensamento criado com sucesso!')
        req.session.save(()=>{
            res.redirect('/toughts/dashboard')
        })
    }

    static async removeTought(req, res){
        const id = req.body.id;
        const UserId = req.session.userid;

        await Tought.destroy({where: {id:id, UserId: UserId}})

        req.flash('message', 'Pensamento removido com sucesso!')
        req.session.save(()=>{
            res.redirect('/toughts/dashboard')
        })
    }

        static async updateTought(req,res){
            const id = req.params.id;
            const tought = await Tought.findOne({where: {id:id}, raw: true});
            res.render('toughts/edit', {tought})
        }

        static async updateToughtSave(req,res){
            const id = req.body.id;

            const tought = {
                title: req.body.title
            }

            await Tought.update(tought, {where: {id:id}})

            req.flash('message', 'Pensamento atualizado com sucesso!')
            
            req.session.save(()=>{
                res.redirect('/toughts/dashboard')
            })
        }

}

module.exports = ToughtController