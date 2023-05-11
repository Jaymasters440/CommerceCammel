const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');


router.get('/', async (req, res) => {
  // find all tags
  // be sure to include its associated Product data
  try {
    const data = await Tag.findAll({
      include: [{ model: Product }]
    });
    res.status(200).json(data);

  } catch (err) {
    res.status(400).json(err);
  }
});


router.get('/:id', async (req, res) => {
  // find a single tag by its `id`
  // be sure to include its associated Product data
  try {
    const data = await Tag.findByPk(req.params.id,
      {
        include: [{ model: Product }]
      });
    if (!data) {
      res.status(404).json({ message: "No tag by that ID" });
      return;

    }
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});



// create a new tag
router.post('/', (req, res) => {

  try {
    const data = Tag.create({
      tag_name: req.body.tag_name
    })
      .then((tag) => {

        if (req.body.productIds.length) {
          const tagIdArr = req.body.productIds.map((product_id) => {
            return {
              tag_id: tag.id,
              product_id: product_id,
            };
          });
          return ProductTag.bulkCreate(tagIdArr);
        }
        // if no  tags, just respond
        res.status(200).json(tag);
      })
      .then((TagIds) => res.status(200).json(TagIds))
      .catch((err) => {
        console.log(err);
        res.status(400).json(err);
      })
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  };
}
);


router.put('/:id', (req, res) => {
  // update a tag's name by its `id` value
  Tag.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((tag) => {

      return ProductTag.findAll({ where: { tag_id: req.params.id } });
    })
    .then((tags) => {
      // get list of current porduct_ids
      const tagIds = tags.map(({ product_id }) => product_id);
      // create filtered list of new product_ids
      const newTags = req.body.productIds
        .filter((product_id) => !tagIds.includes(product_id))
        .map((product_id) => {
          return {
            tag_id: req.params.id,
            product_id,
          };
        });
      // figure out which ones to remove
      const tagsToRemove = tags
        .filter(({ product_id }) => !req.body.productIds.includes(product_id))
        .map(({ id }) => id);

      // run both actions
      return Promise.all([
        ProductTag.destroy({ where: { id: tagsToRemove } }),
        ProductTag.bulkCreate(newTags),
      ]);
    })
    .then((updatedTags) => res.status(200).json(updatedTags))
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});
router.delete('/:id', async (req, res) => {
  // delete one tag by its `id` value
  try {
    const tagData = await Tag.findByPk(req.params.id);
    if (!tagData) {
      res.status(404).json({ message: "No tag found with that ID" });
      return;
    }
    await tagData.destroy();
    res.status(200).json(tagData);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
