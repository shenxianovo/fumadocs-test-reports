# Use the host application's translation provider

Framework presenters register UI labels with the Fumadocs translation system. They read translations from the host's provider.

The host can select a language and change labels in one place. These settings apply to framework presenters and Fumadocs UI.

Framework presenters interpret native outcomes. Test names, exception messages, and output remain unchanged source content.

The shared provider replaces TUnit's separate locale dictionaries. Both framework presenters now use the host provider. During 0.x development, the package removed the old locale prop.
