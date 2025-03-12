
export default abstract class Page {
	protected root: HTMLElement | undefined = undefined;
	public mounted: boolean = false;
	private cleanupHandlers: (() => void)[] = []
	constructor(public readonly name: string, public readonly path: string) {
	}

	protected abstract onMount(): void;
	protected abstract onCleanup(): void;

	addCleanupHandler(fn: () => void) {
		this.cleanupHandlers.push(fn);
	}
	cleanup() {
		this.cleanupHandlers.forEach(handler => {
			handler();
		})
		this.cleanupHandlers = [];
		this.mounted = false;
		this.root?.remove();
		this.root = undefined;
		this.onCleanup();
	}
	abstract getHtml(): string;
	mount() {
		// const content = this.getHtml();
		// this.root = document.createElement('div');
		// this.root.id = `page-${this.name}`;
		// this.root.classList.add('w-full', 'h-full');
		// this.root.innerHTML = content;
		console.log(`${this.name} mounted!`)
		this.mounted = true;
		this.onMount();
		return this.root;
	}
}
