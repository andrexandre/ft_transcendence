import path from 'path';
import fs from 'fs/promises';
import url from 'url';





export async function loadQueryFile(fileName) {
	
	// Colocar o prefixo de "../queries/"
	const filename = url.fileURLToPath(import.meta.url);
	const dirname = path.dirname(filename);

	const filePath = path.join(dirname, fileName);
	
	return fs.readFile(filePath, 'utf8');
}  
