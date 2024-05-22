import { info, setFailed, getInput } from "@actions/core";
import { Context } from "@actions/github/lib/context";



export const run = (context: Context) => {
  const { eventName } = context;
  info(`Event name: ${eventName}`);

  if (eventName !== "pull_request") {
    setFailed(`Invalid event: ${eventName}, it should be use on pull_request`);
    return;
  }

  const pullRequestTitle = context?.payload?.pull_request?.title;

  info(`Pull Request title: "${pullRequestTitle}"`);

  const regexParam: string | Array<string> = getInput("regexp");
  const flagsParam = getInput("flags");
  const helpMessage = getInput("helpMessage");

  const regexpList = [];
  regexpList.push(...regexParam);

  let matches = false;

  for (const item of regexpList) {
    const regex = RegExp(item, flagsParam);

    if (regex.test(pullRequestTitle)) {
      matches = true;
      break;
    }
  }

  if (!matches) {
    let message = `Pull Request title "${pullRequestTitle}" failed to pass match any of ${regex} regexps.
`;
    if (helpMessage) {
      message = message.concat(helpMessage);
    }

    setFailed(message);
  }
};
