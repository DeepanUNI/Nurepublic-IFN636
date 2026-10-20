const MAX_SEARCH_LENGTH = 100;

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// FR04: turn a price from the query string into a number (undefined = not set, NaN = invalid)
function parsePrice(value) {
  if (value === undefined || value === '') return undefined;
  if (typeof value !== 'string') return NaN;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : NaN;
}

function validateSearch(req, res, next) {
  const { search, sort, category, minPrice, maxPrice } = req.query;

  // SEARCH AND SORT MUST BE IN PLAIN TEXT
 if (search !== undefined && typeof search !== 'string') {
  return res.status(400).json({ message: 'Search must be text' });
  }
  if (sort !== undefined && typeof sort !== 'string') {
    return res.status(400).json({ message: 'Sort must be text' });
  }
  if (category !== undefined && typeof category !== 'string') {
    return res.status(400).json({ message: 'Category must be text' });
  }

  //search strijng cant be too long
  const text = (search || '').trim();
  if (text.length > MAX_SEARCH_LENGTH) {
    return res
      .status(400)
      .json({ message: `Search must be ${MAX_SEARCH_LENGTH} characters or fewer` });
  }

  // FR04: price range must be valid numbers, and min can't be above max
  const min = parsePrice(minPrice);
  const max = parsePrice(maxPrice);
  if (Number.isNaN(min)) {
    return res.status(400).json({ message: 'Minimum price must be a number of 0 or more' });
  }
  if (Number.isNaN(max)) {
    return res.status(400).json({ message: 'Maximum price must be a number of 0 or more' });
  }
  if (min !== undefined && max !== undefined && min > max) {
    return res.status(400).json({ message: 'Minimum price cannot be more than maximum price' });
  }

  //building the filter: title, description, category..
  //empty search then show all products
  const filter = {};
  if (text !== '') {
    const pattern = new RegExp(escapeRegex(text), 'i');

    filter.$or = [
      { title: pattern },
      { description: pattern },
      { category: pattern },
    ];
  }

  // FR04: exact category match (not case-sensitive)
  const categoryText = (category || '').trim();
  if (categoryText !== '') {
    filter.category = new RegExp(`^${escapeRegex(categoryText)}$`, 'i');
  }

  // FR04: price range
  if (min !== undefined || max !== undefined) {
    filter.price = {};
    if (min !== undefined) filter.price.$gte = min;
    if (max !== undefined) filter.price.$lte = max;
  }

  req.searchFilter = filter;

  //pass the request to the next stop whichis the contriller
  next();
}
  module.exports = {validateSearch, escapeRegex, parsePrice, MAX_SEARCH_LENGTH};
