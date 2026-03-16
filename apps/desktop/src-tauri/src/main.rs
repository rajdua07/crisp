// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Emitter, Manager, State,
};

/// Tracks the last clipboard content to detect changes (new pastes)
struct ClipboardState {
    last_content: Mutex<String>,
    api_url: Mutex<String>,
    auth_token: Mutex<Option<String>>,
}

#[derive(Serialize, Deserialize, Clone)]
struct PasteDetected {
    text: String,
    /// Heuristic confidence (0-1) that the text is AI-generated
    ai_confidence: f64,
}

/// Heuristic: does this text look like AI-generated content?
/// Checks for common AI tells — this is a quick client-side filter
/// before hitting the API for real scoring.
fn estimate_ai_probability(text: &str) -> f64 {
    let lower = text.to_lowercase();
    let ai_markers = [
        "comprehensive analysis",
        "leverage",
        "synergy",
        "multi-pronged",
        "it's important to note",
        "in conclusion",
        "delve into",
        "i hope this message finds you well",
        "it's worth noting",
        "in today's",
        "landscape",
        "navigate the complexities",
        "holistic approach",
        "streamline",
        "paradigm",
        "actionable insights",
        "circle back",
        "deep dive",
        "at the end of the day",
        "moving forward",
        "best practices",
        "key takeaways",
        "game-changer",
        "cutting-edge",
    ];

    let matches = ai_markers.iter().filter(|m| lower.contains(**m)).count();
    let base_score = (matches as f64 * 0.15).min(0.9);

    // Long paragraphs with no line breaks = very AI
    let avg_paragraph_len = {
        let paragraphs: Vec<&str> = text.split("\n\n").filter(|p| !p.trim().is_empty()).collect();
        if paragraphs.is_empty() {
            0
        } else {
            text.len() / paragraphs.len()
        }
    };
    let length_bonus = if avg_paragraph_len > 200 { 0.15 } else { 0.0 };

    // Em dashes are a strong AI signal
    let emdash_bonus = if text.contains('—') { 0.1 } else { 0.0 };

    (base_score + length_bonus + emdash_bonus).min(1.0)
}

/// Called from the frontend to configure the API connection
#[tauri::command]
fn configure_api(
    state: State<'_, ClipboardState>,
    api_url: String,
    auth_token: Option<String>,
) {
    *state.api_url.lock().unwrap() = api_url;
    *state.auth_token.lock().unwrap() = auth_token;
}

/// Get current clipboard text (called from frontend on demand)
#[tauri::command]
fn get_last_paste(state: State<'_, ClipboardState>) -> Option<PasteDetected> {
    let content = state.last_content.lock().unwrap().clone();
    if content.is_empty() {
        return None;
    }
    let confidence = estimate_ai_probability(&content);
    Some(PasteDetected {
        text: content,
        ai_confidence: confidence,
    })
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_positioner::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .manage(ClipboardState {
            last_content: Mutex::new(String::new()),
            api_url: Mutex::new("https://crisp.app".to_string()),
            auth_token: Mutex::new(None),
        })
        .invoke_handler(tauri::generate_handler![configure_api, get_last_paste])
        .setup(|app| {
            // Build tray menu
            let show_item = MenuItem::with_id(app, "show", "Open Crisp", true, None::<&str>)?;
            let quit_item = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show_item, &quit_item])?;

            // Create tray icon
            let _tray = TrayIconBuilder::new()
                .menu(&menu)
                .tooltip("Crisp — Make AI sound like you")
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "show" => {
                        if let Some(window) = app.get_webview_window("settings") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("settings") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                })
                .build(app)?;

            // Start clipboard polling on a background thread
            let app_handle = app.handle().clone();
            std::thread::spawn(move || {
                clipboard_poll_loop(app_handle);
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running Crisp");
}

/// Polls clipboard every 500ms, emits "paste-detected" when new content appears
/// that scores above the AI-confidence threshold.
fn clipboard_poll_loop(app: AppHandle) {
    use tauri_plugin_clipboard_manager::ClipboardExt;

    let state = app.state::<ClipboardState>();
    let threshold = 0.3; // Show popover if AI confidence >= 30%

    loop {
        std::thread::sleep(std::time::Duration::from_millis(500));

        if let Ok(content) = app.clipboard().read_text() {
            let mut last = state.last_content.lock().unwrap();
            if content != *last && content.len() > 50 {
                *last = content.clone();
                drop(last);

                let confidence = estimate_ai_probability(&content);
                if confidence >= threshold {
                    let payload = PasteDetected {
                        text: content,
                        ai_confidence: confidence,
                    };

                    // Emit to the popover window
                    let _ = app.emit("paste-detected", payload);

                    // Show the popover window
                    if let Some(window) = app.get_webview_window("popover") {
                        let _ = window.show();
                        let _ = window.set_focus();
                    }
                }
            }
        }
    }
}
