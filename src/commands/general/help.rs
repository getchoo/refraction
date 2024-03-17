use eyre::Result;
use poise::{builtins, samples::HelpConfiguration};

use crate::Context;

/// View the help menu
#[poise::command(slash_command, prefix_command)]
pub async fn help(ctx: Context<'_>, command: Option<String>) -> Result<()> {
	builtins::help(
		ctx,
		command.as_deref(),
		HelpConfiguration {
			extra_text_at_bottom: &format!(
				"Use /help for more information about a specific command!"
			),
			..HelpConfiguration::default()
		},
	)
	.await?;

	Ok(())
}