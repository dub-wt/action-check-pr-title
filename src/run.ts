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

  const regexParam = getInput("regexp", { required: true });
  const flagsParam = getInput("flags");
  const helpMessage = getInput("helpMessage");

  const regexpList = parseRegexList(regexParam);

  info(`Regex list: ${regexpList.join(", ")}`);

  let matches = false;
  for (const item of regexpList) {
    const regex = RegExp(item, flagsParam);

    if (regex.test(pullRequestTitle)) {
      matches = true;
      break;
    }
  }

  if (!matches) {
    let message = `Pull Request title "${pullRequestTitle}"`;

    if (regexpList.length === 1) {
      message += `fails to match the regex pattern: /${regexpList[0]}/`;
    } else {
      message += `fails to match any of the regex patterns: ${regexpList
        .map((item) => `/${item}/`)
        .join(", ")}`;
    }

    if (helpMessage) {
      message += `\n${helpMessage}`;
    }

    setFailed(message);
  }
};
