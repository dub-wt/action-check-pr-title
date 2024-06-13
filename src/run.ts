import { info, setFailed, getInput } from "@actions/core";
import { Context } from "@actions/github/lib/context";

function parseRegexList(input: string): string[] {
  return input.split(/\r|\n/).map((line) => line?.trim());
}

export const run = (context: Context) => {
  const { eventName } = context;
  info(`Event name: ${eventName}`);

  if (eventName !== "pull_request") {
    setFailed(`Invalid event: ${eventName}, it should be use on pull_request`);
    return;
  }

  const pullRequestTitle = context?.payload?.pull_request?.title;

  info(`Pull Request title: "${pullRequestTitle}"`);

  const regexParam = getInput("regexp");
  const flagsParam = getInput("flags");
  const helpMessage = getInput("helpMessage");

  const regexpList = parseRegexList(regexParam);

  info("Regex patterns:");
  info(regexpList.map((item) => `  /${item}/`).join("\n"));

  let matches = false;
  for (const item of regexpList) {
    const regex = RegExp(item, flagsParam);

    if (regex.test(pullRequestTitle)) {
      matches = true;
      info(
        `Pull Request title "${pullRequestTitle}" matches the regex pattern: /${item}/`
      );
      break;
    }
  }

  if (!matches) {
    let message = `Pull Request title fails to match any of the regex patterns.`;

    if (helpMessage) {
      message += `\n${helpMessage}`;
    }

    setFailed(message);
  }
};
