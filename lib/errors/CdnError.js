'use strict';

class CdnError extends Error {

  constructor(message, status) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    this.status = status;
    Error.captureStackTrace(this, this.constructor);
  }

}

module.exports = CdnError;
