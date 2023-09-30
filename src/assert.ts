export default function assert(assertion: boolean): asserts assertion {
	if (!assertion) throw Error("assertion failed");
}