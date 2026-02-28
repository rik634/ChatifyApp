package com.chatify.backend.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.mongodb.core.convert.MongoCustomConversions;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Configuration
public class MongoConfig {

    @Bean
    public MongoCustomConversions mongoCustomConversions() {
        List<Converter<?, ?>> converters = new ArrayList<>();

        // 1. Convert OffsetDateTime to Date (for saving to Mongo)
        converters.add(new Converter<OffsetDateTime, Date>() {
            @Override
            public Date convert(OffsetDateTime source) {
                return Date.from(source.toInstant());
            }
        });

        // 2. Convert Date back to OffsetDateTime (for reading from Mongo)
        converters.add(new Converter<Date, OffsetDateTime>() {
            @Override
            public OffsetDateTime convert(Date source) {
                return source.toInstant().atOffset(ZoneOffset.UTC);
            }
        });

        return new MongoCustomConversions(converters);
    }
}