type Runtime = import('@astrojs/cloudflare').Runtime<Env>;

declare namespace App {
	import type {Image} from "./types";

	interface Locals extends Runtime {
		images: Array<Image>;
	}
}
