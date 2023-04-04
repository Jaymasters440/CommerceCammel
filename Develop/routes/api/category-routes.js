const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint

router.get('/', async (req, res) => {
  // find all categories
  // be sure to include its associated Products
  try{
    const data = await Category.findAll();
    res.status(200).json(data);

  } catch(err){
    res.status(400).json(err);
  }
});

router.get('/:id', async (req, res) => {
  // find one category by its `id` value
  // be sure to include its associated Products
  try{
    const data = await Category.findByPk(req.params.id);
    if(!data){
      res.status(404).json({message:"No ategory found with that id"});
      return;
    } 
    res.status(200).json(data);
  } catch (err){
    res.status(500).json(err);
  }
});

router.post('/', async (req, res) => {
  // create a new category
  try{
    const data = await Category.create({
      category_name:req.body.name
    })
  } catch (err){
    res.status(400).json(err);
  }

});

router.put('/:id', (req, res) => {
  // update a category by its `id` value
});

router.delete('/:id', (req, res) => {
  // delete a category by its `id` value by .destroy

});

module.exports = router;
