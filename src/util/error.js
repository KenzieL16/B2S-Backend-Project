class CustomError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.name = this.constructor.name;
    }
}

class BadRequestError extends CustomError {
    constructor(message = 'Bad Request') {
        super(400, message);
    }
}

class InternalServerError extends CustomError {
    constructor(message = 'Internal Server Error') {
        super(500, message);
    }
}

class DUPLICATE_NAME extends CustomError {
    constructor(message = 'Duplicate Name') {
        super(400, message);
    }
}

export default {
    CustomError,
    BadRequestError,
    InternalServerError,
    DUPLICATE_NAME
};