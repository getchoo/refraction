use crate::utils;

use eyre::Result;
use log::trace;
use once_cell::sync::Lazy;
use poise::serenity_prelude::Message;
use regex::Regex;

const HASTE: &str = "https://hst.sh";
const RAW: &str = "/raw";

pub struct Haste;

impl super::LogProvider for Haste {
	async fn find_match(&self, message: &Message) -> Option<String> {
		static REGEX: Lazy<Regex> =
			Lazy::new(|| Regex::new(r"https://hst\.sh(?:/raw)?/(\w+(?:\.\w*)?)").unwrap());

		trace!("Checking if message {} is a hst.sh paste", message.id);
		super::get_first_capture(&REGEX, &message.content)
	}

	async fn fetch(&self, content: &str) -> Result<String> {
		let url = format!("{HASTE}{RAW}/{content}");
		let log = utils::text_from_url(&url).await?;

		Ok(log)
	}
}
