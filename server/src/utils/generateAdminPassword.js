import bcrypt from "bcrypt";

const password = "Admin@12345";

const hash = await bcrypt.hash(password, 10);

console.log(hash);