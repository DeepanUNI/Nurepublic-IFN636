const MAX_SEARCH_LENGTH = 100;

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function validateSearch(req, res, next) {
  const { search, sort } = req.query;

  // SEARCH AND SORT MUST BE IN PLAIN TEXT
 if (search !== undefined && typeof search !== 'string') {
  return res.status(400).json({ message: 'Search must be text' });
  }
  if (sort !== undefined && typeof sort !== 'string') {
    return res.status(400).json({ message: 'Sort must be text' });
  }

  //search strijng cant be too long
  const text = (search || '').trim();
  if (text.length > MAX_SEARCH_LENGTH) {
    return res
      .status(400)
      .json({ message: `Search must be ${MAX_SEARCH_LENGTH} characters or fewer` });
  }

  //building the filter: title, description, category..
  //empty search then show all products
  if (text === '') {
    req.searchFilter = {};
  } else {
    const pattern = new RegExp(escapeRegex(text), 'i');

    req.searchFilter = {
      $or: [
        { title: pattern },
        { description: pattern },
        { category: pattern },
      ],
    };
  }

  //pass the request to the next stop whichis the contriller
  next();
}
  module.exports = {validateSearch, escapeRegex, MAX_SEARCH_LENGTH};
