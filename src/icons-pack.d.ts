declare module "@icons-pack/react-simple-icons/icons/*.mjs" {
	const Icon: React.ComponentType<
		React.SVGProps<SVGSVGElement> & {
			size?: number | string;
			title?: string;
		}
	>;

	export default Icon;
}
