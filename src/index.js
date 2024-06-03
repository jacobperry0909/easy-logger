/**
 *  @param {boolean} useColors - log with colors in the terminal\
 */



class Logger {
    constructor(useColors) {
        this.useColors = useColors || true
    }
    
}


const logger = new Logger()

module.exports = logger