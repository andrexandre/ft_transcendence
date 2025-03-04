

export async function registerUsersDecorator(username, email, password) {
    
    return new Promise((resolve, reject) => {
        this.sqlite.run(`INSERT INTO users (username, email, password) VALUES ('${username}', '${email}', '${password}');`, (err) => {
            if (err) {
                reject({status: 409, message: 'Username or email already exist!'});
                // reject("Username or email already exist!");
            } else {
                resolve('');
            }
        });
    });
}


export async function getUserByUsernameDecorator(username) {
    
    return new Promise((resolve, reject) => {
        this.sqlite.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
            if (err) {
                reject(err);
            } else if (row) {
                resolve(row);
            } else {
                reject('User not found!');
            }
          });
    });
}
