import { Colors, EmbedBuilder, Message, ThreadChannel } from "discord.js";

function findFirstImage(message: Message): string | undefined {
  const result = message.attachments.find((attach) => {
    return attach.contentType?.startsWith("image/");
  });
  if (result == undefined) {
    return undefined;
  } else {
    return result.url;
  }
}

export async function expandDiscordLink(message: Message): Promise<void> {
  const re =
    /(https?:\/\/)?(?:canary\.|ptb\.)?discord(?:app)?\.com\/channels\/(?<server_id>\d+)\/(?<channel_id>\d+)\/(?<message_id>\d+)/g;
  let execResult = re.exec(message.content);
  while (!(execResult == null || execResult.groups == undefined)) {
    if (execResult.groups.server_id != message.guildId) {
      continue; // do not let the bot leak messages from one server to another
    }
    const channel = await message.guild?.channels.fetch(
      execResult.groups.channel_id
    );
    if (channel == undefined || channel == null || !channel.isTextBased()) {
      continue;
    }
    if (channel instanceof ThreadChannel) {
      if (
        !channel.parent?.members?.some((user) => user.id == message.author.id)
      ) {
        continue; // do not reveal a message to a user who can't see it
      }
    } else {
      if (!channel.members?.some((user) => user.id == message.author.id)) {
        continue; // do not reveal a message to a user who can't see it
      }
    }
    try {
      const messageToShow = await channel.messages.fetch(
        execResult.groups.message_id
      );
      const builder = new EmbedBuilder()
        .setAuthor({
          name: `${messageToShow.author.username}#${messageToShow.author.discriminator}`,
          iconURL: messageToShow.author.displayAvatarURL(),
        })
        .setDescription(messageToShow.content)
        .setColor(Colors.Aqua);
      if (messageToShow.attachments.size > 0) {
        let attachmentsString = "";
        messageToShow.attachments.forEach((value) => {
          attachmentsString += `[${value.name}](${value.url}) `;
        });
        builder.addFields({ name: "Attachments", value: attachmentsString });
        const firstImage = findFirstImage(messageToShow);
        if (firstImage != undefined) {
          builder.setImage(firstImage);
        }
      }
      builder.addFields({
        name: "Source",
        value: `[Jump to original message](${messageToShow.url})`,
      });
      message.channel.send({ embeds: [builder] });
    } catch (e) {
      console.error(e);
      continue;
    }
    execResult = re.exec(message.content);
  }
}
