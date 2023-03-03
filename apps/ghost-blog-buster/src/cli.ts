#!/usr/bin/env node
import * as exportContent from "./commands/export-content";
import * as interactiveCommand from "./commands/interactive";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

yargs(hideBin(process.argv)).command(interactiveCommand).command(exportContent).demandCommand(1).parse();
