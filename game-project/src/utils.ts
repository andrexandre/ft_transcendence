// src/utils.ts
export const Logger = {
    enabled: true,
    
	log: (...args: any[]) => {
        if (Logger.enabled) console.log(...args);
	},
    
	warn: (...args: any[]) => {
        if (Logger.enabled) console.warn(...args);
	},
    
	error: (...args: any[]) => {
        if (Logger.enabled) console.error(...args);
	},
    
	toggle: (state?: boolean) => {
        Logger.enabled = typeof state === "boolean" ? state : !Logger.enabled;
	}
};

Logger.enabled = true;