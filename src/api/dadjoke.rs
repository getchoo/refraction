use crate::api::REQWEST_CLIENT;

use color_eyre::eyre::{eyre, Result};
use log::*;
use reqwest::StatusCode;

const DADJOKE: &str = "https://icanhazdadjoke.com";

pub async fn get_joke() -> Result<String> {
    let req = REQWEST_CLIENT.get(DADJOKE).build()?;

    info!("making request to {}", req.url());
    let resp = REQWEST_CLIENT.execute(req).await?;
    let status = resp.status();

    if let StatusCode::OK = status {
        Ok(resp.text().await?)
    } else {
        Err(eyre!("Failed to fetch joke from {DADJOKE} with {status}"))
    }
}