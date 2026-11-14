# Architecture
- Keep sovereign intelligence switching in a pure mode resolver and a separate Doom presentation component; this isolates persona commands without removing existing JARVIS capabilities or shared history.
- Theme Doom through a root data attribute and semantic CSS tokens; this preserves the default JARVIS theme on exit.
- Reset JarvisChat on Fast Refresh when its hook layout changes; development must not reuse incompatible React hook queues.
- Keep STONY in a separately scoped console with a shared pure command parser and browser-local validated storage; its typed and spoken commands must use the existing message pipeline without resetting underlying modes.