const Products = require("../models/product");
const { errorLauncher } = require("../services/user.services");
const {
  filtroBodyOffsetLimitSearch,
  searchOffsetLimit,
} = require("../services/product.services");

module.exports = {
  async listProductsOffsetLimit(req, res) {
    try {
      const user_id = req.payload.id;
      const { name, type_product } = req.query;
      var { offset, limit } = req.params;

      await filtroBodyOffsetLimitSearch(offset, limit, name, type_product);

      const items_for_page = parseInt(limit);
      const actual_page = parseInt(offset);
      //calculo para saber o inicio da paginação no banco de dados
      var start = parseInt((actual_page - 1) * items_for_page);
      //se o start for menor que 0, será setado em 0 para não quebrar a paginação
      start < 0 ? (start = 0) : (start = start);

      //para garantir a busca, o nome do produto será buscado em 3 variações (lowercase, uppercase e capitalize)
      const name_variation = [
        name.toLowerCase(),
        name.toUpperCase(),
        (nameCapitalize = name[0].toUpperCase() + name.slice(1)),
      ];
      await searchOffsetLimit(
        start,
        items_for_page,
        actual_page,
        name_variation,
        type_product,
        user_id,
        res,
        Products
      );
    } catch (error) {
      errorLauncher(error, res);
    }
  },
  async listAllProducts(req, res) {
    try {
      var { offset, limit } = req.params
      const { name, type_product } = req.query

      await filtroBodyOffsetLimitSearch(offset, limit, name, type_product);

      limit > 20 ? (limit = 20) : limit
      offset < 0 ? (offset - 1) : (offset = offset)

      const actual_page = parseInt(offset);
      const start = parseInt(offset)
      const items_for_page = parseInt(limit)
      const name_variation = [
        name.toLowerCase(),
        name.toUpperCase(),
        (nameCapitalize = name[0].toUpperCase() + name.slice(1)),
      ]

      Products.findAndCountAll({
        where: {
          name: name_variation,
          type_product: type_product
        },
        offset: start,
        limit: items_for_page,
        order: [
          ['total_stock', 'DESC']
        ]
      })
        .then((result) => {
          const total_items = result.count;
          const total_pages = Math.ceil(total_items / items_for_page);
          var next_page = actual_page < total_pages ? actual_page + 1 : 0;
          var prev_page = actual_page > 1 ? actual_page - 1 : 0;

          if (actual_page > 1) {
            prev_page = actual_page - 1;
          }

          if (actual_page >= total_pages) {
            next_page = 1;
          }
          const products = result.rows;
          if (products.length == 0) {
            return res.sendStatus(204);
          }
          return res.status(200).json({
            status: "200",
            total_items,
            items_for_page,
            total_pages,
            prev_page,
            next_page,
            actual_page,
            products,
          });
        })
        .catch((error) => {
          return res.status(500).json({
            status: "500",
            error: error,
            message: error.message,
            cause: "Foi erro do desenvolvedor :(",
          });
        });
    } catch (error) {
      errorLauncher(error, res)
    }
  }
};
