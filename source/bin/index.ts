#!/usr/bin/env node
import program from "commander-version";
import { listCommand } from "../";

program(__dirname)
  .name("pantheon")
  .addCommand(listCommand)
  .parse();

