export class SortedSet extends Array {
  constructor(...args) {
    super(...args);
    this.case_insensitive = false;
    this.cmp_options = { numeric: true, caseFirst: 'upper', sensitivity: 'case' };
    this._f_or_k = 'id';
    this.resort();
  }

  caseInsensitiveSort(b) {
    if (typeof b === 'boolean') {
      if (b) { // INSENSITIVE
        this.cmp_options.caseFirst = false;
        this.cmp_options.sensitivity = 'base';
      } else { // SENSITIVE
        this.cmp_options.caseFirst = 'upper';
        this.cmp_options.sensitivity = 'case';
      }
      this.case_insensitive = b;
      this.resort();
    }
    return this;
  }

  _cmp(a, b) {
    const f_or_k = this._f_or_k;
    const av = ('' + (a && a[f_or_k]) || '');
    const bv = ('' + (b && b[f_or_k]) || '');
    const acase = this.case_insensitive ? av.toLowerCase() : av;
    const bcase = this.case_insensitive ? bv.toLowerCase() : bv;
    return acase < bcase ? -1 : acase > bcase ? 1 : 0;
  }

  sortOn(f_or_k) {
    if (typeof f_or_k === 'string') {
      this._f_or_k = f_or_k;
    } else if (typeof f_or_k === 'function') {
      this._cmp = f_or_k;
    } else {
      throw new Error("sortOn expects a function or a property name");
    }
    this.resort();
    return this;
  }

  // Backward compatibility: add sort_on as an alias of sortOn
  sort_on(f_or_k) {
    return this.sortOn(f_or_k);
  }

  resort() {
    this.sort(this._cmp.bind(this));
  }

  clear() {
    this.length = 0;
    return this;
  }

  add(itm) {
    const idx = this.binarySearch(itm, true);
    if (idx === -1) {
      this.splice(idx, 0, itm);
      return idx;
    }
    return idx;
  }

  has(itm) {
    return this.includes(itm);
  }

  remove(itm) {
    const idx = this.binarySearch(itm);
    if (idx > -1) {
      this.splice(idx, 1);
      return itm;
    }
  }

  acquire(itm) {
    const last_state = itm[this.state_property];
    if (last_state && last_state.remove) {
      last_state.remove(itm);
    }
    return this.add(itm);
  }

  binarySearch(sought, ret_ins_idx = false) {
    let bot = 0;
    let top = this.length;
    while (bot < top) {
      const mid = Math.floor((bot + top) / 2);
      const cmp = this._cmp(this[mid], sought);
      if (cmp === 0) return mid;
      if (cmp < 0) bot = mid + 1;
      else top = mid;
    }
    return ret_ins_idx ? bot : -1;
  }
}
