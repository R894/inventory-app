const Item = require('../models/item');
const asyncHandler = require("express-async-handler");
const Category = require('../models/category');
const { body, validationResult } = require("express-validator");

// Display home page index.
exports.index = asyncHandler(async (req, res, next) => {
    // get details of items and categories in parallel
    const [numItems, numCategories] = await Promise.all([Item.countDocuments({}).exec(), Category.countDocuments({}).exec()]);
    res.render("index", {
        title: "Inventory Home",
        item_count: numItems,
        category_count: numCategories,
    });
});

// Display list of all Items.
exports.item_list = asyncHandler(async (req, res, next) => {
    const allItems = await Item.find().sort({name:1}).exec();
    
    res.render("item_list", {title: "All Items", item_list: allItems});
});

// Display detail page for a specific Item.
exports.item_detail = asyncHandler(async (req, res, next) => {
    const item = await Item.findById(req.params.id).populate("category").exec();

    if(item === null){
        const err = new Error("Item not found");
        err.status = 404;
        return next(err);
    }
    res.render("item_detail", {
        title: item.name,
        item: item,
        categories: item.category,
    });
});

// Display Item create form on GET
exports.item_create_get = asyncHandler(async (req, res, next) => {
    const allCategories = await Category.find().exec();

    res.render("item_form", {
        title: "Create Item",
        categories: allCategories,
    })
});

// Handle Item create on POST.
exports.item_create_post = [
    // Convert Category to an array
    (req, res, next) => {
        if (!(req.body.category instanceof Array)) {
          if (typeof req.body.category === "undefined") req.body.category = [];
          else req.body.category = new Array(req.body.category);
        }
        next();
    },

    // Validate and sanitize fields.
    body("name", "Name must contain at least 3 characters")
    .trim()
    .isLength({min:3})
    .escape(),

    body("price", "Price must be a positive number")
    .trim()
    .isInt({min:1})
    .escape(),

    body("numstock", "Stock number must be a positive")
    .trim()
    .isInt({min:0})
    .escape(),

    body("description")
        .trim()
        .escape(),
    
    body("category.*").escape(),

    asyncHandler(async (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);
    
        // Create a Item object with escaped and trimmed data.
        const item = new Item({
          name: req.body.name,
          description: req.body.description,
          price: req.body.price,
          numstock: req.body.numstock,
          category: req.body.category,
        });

        if(!errors.isEmpty()){
            // There are errors. Render form again with sanitized values/error messages.

            // Get all categories for form.
            const allCategories = await Category.find().exec();

            // Mark our selected Categories as checked.
            for (const category of allCategories) {
                if (item.category.includes(category._id)) {
                    category.checked = "true";
                }
            }
            res.render("item_form", {
                title: "Create Item",
                categories: allCategories,
                errors: errors.array(),
            });
        }else {
            // Data from form is valid. Save Item.
            await item.save();
            res.redirect(item.url);
        }
    
    }),
]

// Display Item delete form on GET.
exports.item_delete_get = asyncHandler(async (req, res, next) => {
    res.send("NOT IMPLEMENTED: item delete GET");
});

// Handle Item delete on POST.
exports.item_delete_post = asyncHandler(async (req, res, next) => {
    res.send("NOT IMPLEMENTED: item delete POST");
});

// Display Item update form on GET.
exports.item_update_get = asyncHandler(async (req, res, next) => {
    res.send("NOT IMPLEMENTED: item update GET");
});

// Handle Item update on POST.
exports.item_update_post = asyncHandler(async (req, res, next) => {
    res.send("NOT IMPLEMENTED: item update POST");
});