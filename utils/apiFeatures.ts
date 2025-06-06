class APIFeatures {
  public query: any;
  private queryString: Record<string, any>;

  constructor(query: any, queryString: Record<string, any>) {
    this.query = query;
    this.queryString = queryString;
  }

  // ! BUILT THE QUERY
  filter(): this {
    const queryObj = { ...this.queryString };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((val) => delete queryObj[val]);

    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(/\b(gt|gte|lt|lte)\b/g, (matchedVal) => "$" + matchedVal);

    const queryObj2 = JSON.parse(queryString);
    this.query = this.query.find(queryObj2);
    return this;
  }

  // ! APPLY SORTING
  sort(): this {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("_id"); // Default sorting by _id
    }
    return this;
  }

  // ! APPLY PAGINATION
  paginate(): this {
    const PAGE = Number(this.queryString.page) || 1;
    const LIMIT = Number(this.queryString.limit) || 100;
    const SKIP = (PAGE - 1) * LIMIT;

    this.query = this.query.skip(SKIP).limit(LIMIT);
    return this;
  }

  // ! APPLY PROJECTION
  limitFields(): this {
    if (this.queryString.fields) {

      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    }
    return this;
  }
}

export default APIFeatures;
