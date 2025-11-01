package com.flashcards.app.di

import android.content.Context
import androidx.room.Room
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {

    // TODO: Implement Room database
    // @Provides
    // @Singleton
    // fun provideFlashcardsDatabase(
    //     @ApplicationContext context: Context
    // ): FlashcardsDatabase {
    //     return Room.databaseBuilder(
    //         context,
    //         FlashcardsDatabase::class.java,
    //         "flashcards_database"
    //     )
    //         .fallbackToDestructiveMigration()
    //         .build()
    // }

    // @Provides
    // fun provideFlashcardDao(database: FlashcardsDatabase): FlashcardDao {
    //     return database.flashcardDao()
    // }
}
