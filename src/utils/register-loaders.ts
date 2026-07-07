/**
 * Registers all page data loaders.
 */

import { registerViewerDataLoader } from "~/routes/viewer";
import { registerGaiaOperations } from "./gaia-operations";

registerGaiaOperations();
registerViewerDataLoader();
