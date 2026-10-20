//sort products//

const { ValidationError } = require('../errors/AppError');

//parent class//

class ProductSort{
    constructor(name) {
    if (new.target === ProductSort) {
      throw new Error('ProductSort is a base class. Create a child class instead.');
    }
    this.name = name;
  }

  getSortOrder() {
    throw new Error('getSortOrder() must be implemented by the child class');
  }

}

// Child classes: one per way of sorting
class NewestSort extends ProductSort {
  constructor() { super('newest'); }
  getSortOrder() { return { createdAt: -1 }; }   // newest first
}

class PriceLowToHighSort extends ProductSort {
  constructor() { super('price_asc'); }
  getSortOrder() { return { price: 1 }; }        // cheapest first
}

class PriceHighToLowSort extends ProductSort {
  constructor() { super('price_desc'); }
  getSortOrder() { return { price: -1 }; }       // most expensive first
}

class TitleAToZSort extends ProductSort {
  constructor() { super('title_asc'); }
  getSortOrder() { return { title: 1 }; }        // A to Z
}

//facttoy which picks which class to create//
class SortFactory {
    static getSort(sortType){
        if (sortType == 'newest'){
            return new NewestSort();
        } else if (sortType === 'price_asc') {
            return new PriceLowToHighSort();
        } else if (sortType == 'price_desc'){
            return new PriceHighToLowSort();
        } else if (sortType === 'title_asc') {
           return new TitleAToZSort();
        }else{
            throw new ValidationError(`Unknown sort type: ${sortType}`);
        }
    }
}

module.exports= {
    SortFactory,
    ProductSort,
    NewestSort,
    PriceLowToHighSort,
    PriceHighToLowSort,
    TitleAToZSort,
};
