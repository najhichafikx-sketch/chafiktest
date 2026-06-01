const path = require('path');
const fs = require('fs');

// Vercel-friendly mock DB
const dbMock = {
  exec: (query) => { console.log("DB Exec:", query); },
  prepare: (query) => {
    return {
      run: (...args) => { return { lastInsertRowid: 1, changes: 1 }; },
      get: (...args) => { return null; },
      all: (...args) => { return []; }
    };
  }
};

module.exports = dbMock;
